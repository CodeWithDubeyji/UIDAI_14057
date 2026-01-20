"""
Geospatial Analytics Endpoints (Metrics 11-15)
"""
from fastapi import APIRouter
import numpy as np
from sklearn.cluster import DBSCAN, KMeans
from sklearn.preprocessing import StandardScaler
import sys
sys.path.append('..')
from db.duckdb_loader import get_connection

router = APIRouter(prefix="/metrics", tags=["Geospatial"])


@router.get("/enrollment-cold-clusters")
def enrollment_cold_clusters():
    """Metric 11: DBSCAN clusters of low-enrollment pincodes"""
    con = get_connection()
    result = con.execute("""
        SELECT pincode, district, state, (age_0_5 + age_5_17 + age_18_greater) AS total
        FROM enrollment ORDER BY total ASC LIMIT 500
    """).fetchall()
    if len(result) < 5:
        return {"metric": "enrollment_cold_clusters", "message": "Insufficient data"}
    pincodes = [int(str(r[0])[:3]) if r[0] else 0 for r in result]
    totals = [r[3] if r[3] else 0 for r in result]
    X = np.array(list(zip(pincodes, totals)))
    X_scaled = StandardScaler().fit_transform(X)
    clusters = DBSCAN(eps=0.5, min_samples=3).fit_predict(X_scaled)
    cluster_data = {}
    for i, r in enumerate(result):
        cid = int(clusters[i])
        if cid not in cluster_data:
            cluster_data[cid] = {"pincodes": [], "districts": set(), "states": set(), "totals": []}
        cluster_data[cid]["pincodes"].append(r[0])
        cluster_data[cid]["districts"].add(r[1])
        cluster_data[cid]["states"].add(r[2])
        cluster_data[cid]["totals"].append(r[3])
    formatted = [{"cluster": c if c >= 0 else "noise", "count": len(d["pincodes"]),
                  "districts": list(d["districts"])[:5], "states": list(d["states"]),
                  "avg_enrollment": round(np.mean(d["totals"]), 2)} for c, d in cluster_data.items()]
    return {"metric": "enrollment_cold_clusters", "clusters": formatted}


@router.get("/update-hot-clusters")
def update_hot_clusters():
    """Metric 12: KMeans clusters of high-update pincodes"""
    con = get_connection()
    result = con.execute("""
        WITH update_cnt AS (
            SELECT e.pincode, e.district, e.state,
                   (SELECT COUNT(*) FROM biometric b WHERE b.pincode = e.pincode) +
                   (SELECT COUNT(*) FROM demographic d WHERE d.pincode = e.pincode) AS updates
            FROM enrollment e GROUP BY e.pincode, e.district, e.state
        )
        SELECT * FROM update_cnt WHERE updates > 0 ORDER BY updates DESC LIMIT 300
    """).fetchall()
    if len(result) < 5:
        return {"metric": "update_hot_clusters", "message": "Insufficient data"}
    pincodes = [int(str(r[0])[:3]) if r[0] else 0 for r in result]
    updates = [r[3] for r in result]
    X = np.array(list(zip(pincodes, updates)))
    X_scaled = StandardScaler().fit_transform(X)
    n_clusters = min(5, max(2, len(result) // 20))
    clusters = KMeans(n_clusters=n_clusters, random_state=42, n_init=10).fit_predict(X_scaled)
    cluster_data = {}
    for i, r in enumerate(result):
        cid = int(clusters[i])
        if cid not in cluster_data:
            cluster_data[cid] = {"pincodes": [], "states": set(), "updates": []}
        cluster_data[cid]["pincodes"].append(r[0])
        cluster_data[cid]["states"].add(r[2])
        cluster_data[cid]["updates"].append(r[3])
    formatted = [{"cluster": c, "count": len(d["pincodes"]), "states": list(d["states"]),
                  "avg_updates": round(np.mean(d["updates"]), 2)} for c, d in cluster_data.items()]
    return {"metric": "update_hot_clusters", "num_clusters": n_clusters, "clusters": formatted}


@router.get("/moran-i")
def spatial_autocorrelation_moran():
    """Metric 13: Moran's I on district enrollments"""
    con = get_connection()
    result = con.execute("""
        SELECT district, state, SUM(age_0_5 + age_5_17 + age_18_greater) AS total
        FROM enrollment GROUP BY district, state ORDER BY state, district
    """).fetchall()
    if len(result) < 5:
        return {"metric": "moran_i", "message": "Insufficient data"}
    values = np.array([r[2] for r in result])
    n = len(values)
    W = np.zeros((n, n))
    for i in range(n):
        for j in range(n):
            if i != j and result[i][1] == result[j][1]:
                W[i, j] = 1
            elif abs(i - j) == 1:
                W[i, j] = 0.5
    row_sums = W.sum(axis=1)
    W = np.divide(W, row_sums[:, np.newaxis], where=row_sums[:, np.newaxis] != 0)
    x_mean = np.mean(values)
    x_dev = values - x_mean
    numerator = np.sum(W * np.outer(x_dev, x_dev))
    denominator = np.sum(x_dev ** 2)
    S0 = np.sum(W)
    moran_i = (n / S0) * (numerator / denominator) if denominator != 0 and S0 != 0 else 0
    interp = "positive clustering" if moran_i > 0.1 else "negative/dispersed" if moran_i < -0.1 else "random"
    return {"metric": "moran_i", "value": round(float(moran_i), 4), "interpretation": interp, "districts": n}


@router.get("/contiguity-ratio")
def contiguity_ratio():
    """Metric 14: % districts within 10% of state avg"""
    con = get_connection()
    result = con.execute("""
        WITH dist_total AS (SELECT district, state, SUM(age_0_5 + age_5_17 + age_18_greater) AS total FROM enrollment GROUP BY district, state),
             state_avg AS (SELECT state, AVG(total) AS avg_total FROM dist_total GROUP BY state)
        SELECT d.district, d.state, d.total, s.avg_total,
               ABS(d.total - s.avg_total) / NULLIF(s.avg_total, 0) * 100 AS deviation,
               CASE WHEN ABS(d.total - s.avg_total) / NULLIF(s.avg_total, 0) <= 0.1 THEN 1 ELSE 0 END AS contiguous
        FROM dist_total d JOIN state_avg s ON d.state = s.state ORDER BY d.state
    """).fetchall()
    total = len(result)
    contig = sum(r[5] for r in result)
    return {"metric": "contiguity_ratio", "total_districts": total, "contiguous": contig,
            "ratio_pct": round(contig / total * 100, 2) if total > 0 else 0,
            "sample": [{"district": r[0], "state": r[1], "total": r[2], "state_avg": round(r[3], 2), "deviation_pct": round(r[4], 2)} for r in result[:20]]}


@router.get("/enrollment-density-variance")
def enrollment_density_variance():
    """Metric 15: Standard deviation of enrollments per pincode by state"""
    con = get_connection()
    result = con.execute("""
        SELECT state, COUNT(*) AS pincodes,
               ROUND(AVG(age_0_5 + age_5_17 + age_18_greater), 2) AS avg_enroll,
               ROUND(STDDEV(age_0_5 + age_5_17 + age_18_greater), 2) AS stddev_enroll,
               MIN(age_0_5 + age_5_17 + age_18_greater) AS min_enroll,
               MAX(age_0_5 + age_5_17 + age_18_greater) AS max_enroll
        FROM enrollment GROUP BY state ORDER BY stddev_enroll DESC
    """).fetchall()
    return {"metric": "enrollment_density_variance", "data": [
        {"state": r[0], "pincodes": r[1], "avg": r[2], "stddev": r[3], "min": r[4], "max": r[5]} for r in result]}
