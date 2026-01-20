"""
Anomaly Analytics Endpoints (Metrics 21-25)
"""
from fastapi import APIRouter
import numpy as np
import sys
sys.path.append('..')
from db.duckdb_loader import get_connection

router = APIRouter(prefix="/metrics", tags=["Anomaly"])


@router.get("/enrollment-zscore")
def enrollment_zscore():
    """Metric 21: Enrollment Z-score by pincode vs district avg"""
    con = get_connection()
    result = con.execute("""
        WITH pincode_totals AS (SELECT pincode, district, state, (age_0_5 + age_5_17 + age_18_greater) AS total FROM enrollment),
             district_stats AS (SELECT district, state, AVG(total) AS avg_total, STDDEV(total) AS std_total FROM pincode_totals GROUP BY district, state)
        SELECT p.pincode, p.district, p.state, p.total, d.avg_total, d.std_total,
               CASE WHEN d.std_total > 0 THEN ROUND((p.total - d.avg_total) / d.std_total, 2) ELSE 0 END AS zscore
        FROM pincode_totals p JOIN district_stats d ON p.district = d.district AND p.state = d.state
        ORDER BY ABS(CASE WHEN d.std_total > 0 THEN (p.total - d.avg_total) / d.std_total ELSE 0 END) DESC LIMIT 100
    """).fetchall()
    return {"metric": "enrollment_zscore",
            "data": [{"pincode": r[0], "district": r[1], "state": r[2], "total": r[3], "avg": round(r[4], 2) if r[4] else 0, "zscore": r[6]} for r in result]}


@router.get("/bulk-enrollment-days")
def bulk_enrollment_days():
    """Metric 22: Days with >3σ above normal enrollments"""
    con = get_connection()
    result = con.execute("""
        WITH daily AS (SELECT date, SUM(age_0_5 + age_5_17 + age_18_greater) AS daily_total FROM enrollment WHERE date IS NOT NULL GROUP BY date),
             stats AS (SELECT AVG(daily_total) AS avg_d, STDDEV(daily_total) AS std_d FROM daily)
        SELECT d.date, d.daily_total, s.avg_d, s.std_d, ROUND((d.daily_total - s.avg_d) / NULLIF(s.std_d, 0), 2) AS sigma
        FROM daily d, stats s WHERE d.daily_total > s.avg_d + 3 * s.std_d ORDER BY d.daily_total DESC
    """).fetchall()
    return {"metric": "bulk_enrollment_days", "count": len(result),
            "data": [{"date": str(r[0]), "total": r[1], "avg": round(r[2], 2), "sigma": r[4]} for r in result]}


@router.get("/orphan-updates")
def orphan_updates():
    """Metric 23: Updates without matching enrollment"""
    con = get_connection()
    bio_orphans = con.execute("""
        SELECT b.pincode, b.district, b.state, COUNT(*) FROM biometric b
        LEFT JOIN enrollment e ON b.pincode = e.pincode WHERE e.pincode IS NULL
        GROUP BY b.pincode, b.district, b.state ORDER BY 4 DESC LIMIT 50
    """).fetchall()
    demo_orphans = con.execute("""
        SELECT d.pincode, d.district, d.state, COUNT(*) FROM demographic d
        LEFT JOIN enrollment e ON d.pincode = e.pincode WHERE e.pincode IS NULL
        GROUP BY d.pincode, d.district, d.state ORDER BY 4 DESC LIMIT 50
    """).fetchall()
    return {"metric": "orphan_updates",
            "biometric_orphans": [{"pincode": r[0], "district": r[1], "state": r[2], "count": r[3]} for r in bio_orphans],
            "demographic_orphans": [{"pincode": r[0], "district": r[1], "state": r[2], "count": r[3]} for r in demo_orphans]}


@router.get("/age-distribution-skew")
def age_distribution_skew():
    """Metric 24: Age distribution skewness per district"""
    con = get_connection()
    result = con.execute("""
        SELECT district, state, SUM(age_0_5) AS a0, SUM(age_5_17) AS a5, SUM(age_18_greater) AS a18,
               SUM(age_0_5 + age_5_17 + age_18_greater) AS total
        FROM enrollment GROUP BY district, state
    """).fetchall()
    data = []
    for r in result:
        if r[5] and r[5] > 0:
            pcts = [r[2]/r[5], r[3]/r[5], r[4]/r[5]]
            skew = (pcts[2] - pcts[0]) / (max(pcts) - min(pcts) + 0.001)
            data.append({"district": r[0], "state": r[1], "pct_0_5": round(pcts[0]*100, 2),
                         "pct_5_17": round(pcts[1]*100, 2), "pct_18": round(pcts[2]*100, 2), "skew": round(skew, 3)})
    return {"metric": "age_distribution_skew", "data": sorted(data, key=lambda x: abs(x["skew"]), reverse=True)}


@router.get("/population-mismatch")
def population_mismatch():
    """Metric 25: Pincodes with unusual enrollment counts (outliers)"""
    con = get_connection()
    result = con.execute("""
        WITH stats AS (SELECT AVG(age_0_5 + age_5_17 + age_18_greater) AS avg_e, STDDEV(age_0_5 + age_5_17 + age_18_greater) AS std_e FROM enrollment)
        SELECT pincode, district, state, (age_0_5 + age_5_17 + age_18_greater) AS enrolled,
               ROUND(ABS((age_0_5 + age_5_17 + age_18_greater) - s.avg_e), 2) AS deviation
        FROM enrollment, stats s ORDER BY deviation DESC LIMIT 100
    """).fetchall()
    return {"metric": "population_mismatch",
            "data": [{"pincode": r[0], "district": r[1], "state": r[2], "enrolled": r[3], "deviation": r[4]} for r in result]}
