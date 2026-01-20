"""
Data Insights Analytics Endpoints (Metrics 1-5)
Schema: enrollment(date, state, district, pincode, age_0_5, age_5_17, age_18_greater)
"""
from fastapi import APIRouter
import numpy as np
import sys
sys.path.append('..')
from db.duckdb_loader import get_connection

router = APIRouter(prefix="/metrics", tags=["Data Insights"])


@router.get("/enrollment-deficit-ratio")
def enrollment_deficit_ratio():
    """Metric 1: Enrollment counts by pincode (deficit requires external population data)"""
    con = get_connection()
    result = con.execute("""
        SELECT pincode, district, state,
               (age_0_5 + age_5_17 + age_18_greater) AS total_enrolled
        FROM enrollment
        ORDER BY total_enrolled DESC
        LIMIT 100
    """).fetchall()
    return {"metric": "enrollment_by_pincode", "description": "Total enrollments by pincode",
            "data": [{"pincode": r[0], "district": r[1], "state": r[2], "total": r[3]} for r in result]}


@router.get("/age-cohort-imbalance")
def age_cohort_imbalance():
    """Metric 2: Age Cohort Coverage Imbalance = |age_0_5% - age_18_greater%| across districts"""
    con = get_connection()
    result = con.execute("""
        SELECT district, state,
               SUM(age_0_5) AS total_age_0_5,
               SUM(age_18_greater) AS total_age_18_greater,
               SUM(age_0_5 + age_5_17 + age_18_greater) AS total_enrolled,
               CASE WHEN SUM(age_0_5 + age_5_17 + age_18_greater) > 0 
                    THEN ROUND(ABS(SUM(age_0_5)::FLOAT / SUM(age_0_5 + age_5_17 + age_18_greater) -
                         SUM(age_18_greater)::FLOAT / SUM(age_0_5 + age_5_17 + age_18_greater)) * 100, 2)
                    ELSE 0 END AS imbalance_pct
        FROM enrollment GROUP BY district, state ORDER BY imbalance_pct DESC
    """).fetchall()
    return {"metric": "age_cohort_imbalance", "data": [
        {"district": r[0], "state": r[1], "age_0_5": r[2], "age_18_greater": r[3], 
         "total": r[4], "imbalance_pct": r[5]} for r in result]}


@router.get("/rural-urban-disparity")
def rural_urban_disparity():
    """Metric 3: State-wise enrollment comparison (rural/urban flag not available)"""
    con = get_connection()
    result = con.execute("""
        SELECT state, COUNT(DISTINCT district) AS districts,
               SUM(age_0_5 + age_5_17 + age_18_greater) AS total_enrolled,
               ROUND(AVG(age_0_5 + age_5_17 + age_18_greater), 2) AS avg_per_pincode
        FROM enrollment GROUP BY state ORDER BY total_enrolled DESC
    """).fetchall()
    return {"metric": "state_enrollment_summary", "data": [
        {"state": r[0], "districts": r[1], "total_enrolled": r[2], "avg_per_pincode": r[3]} for r in result]}


@router.get("/pincode-gini")
def pincode_coverage_gini():
    """Metric 4: Pincode Enrollment Gini Coefficient (inequality measure)"""
    con = get_connection()
    result = con.execute("""
        SELECT pincode, (age_0_5 + age_5_17 + age_18_greater) AS total FROM enrollment ORDER BY total
    """).fetchall()
    if not result:
        return {"metric": "pincode_gini", "gini_coefficient": None}
    values = np.array([r[1] for r in result if r[1] and r[1] >= 0])
    if len(values) == 0 or np.sum(values) == 0:
        return {"metric": "pincode_gini", "gini_coefficient": 0}
    n = len(values)
    sorted_vals = np.sort(values)
    gini = (2 * np.sum((np.arange(1, n + 1) * sorted_vals))) / (n * np.sum(sorted_vals)) - (n + 1) / n
    return {"metric": "pincode_gini", "gini_coefficient": round(float(gini), 4),
            "pincodes": n, "min": int(sorted_vals[0]), "max": int(sorted_vals[-1]),
            "median": int(np.median(sorted_vals))}


@router.get("/demographic-deserts")
def demographic_update_deserts():
    """Metric 5: Pincodes with 0 demographic updates in last 12 months"""
    con = get_connection()
    result = con.execute("""
        WITH enrollment_pincodes AS (SELECT DISTINCT pincode, district, state FROM enrollment),
             recent_demo AS (SELECT DISTINCT pincode FROM demographic WHERE date >= CURRENT_DATE - INTERVAL '12 months')
        SELECT e.pincode, e.district, e.state,
               (SELECT MAX(date) FROM demographic WHERE demographic.pincode = e.pincode) AS last_update
        FROM enrollment_pincodes e LEFT JOIN recent_demo r ON e.pincode = r.pincode
        WHERE r.pincode IS NULL ORDER BY e.state, e.district LIMIT 200
    """).fetchall()
    return {"metric": "demographic_deserts", "count": len(result),
            "data": [{"pincode": r[0], "district": r[1], "state": r[2],
                      "last_update": str(r[3]) if r[3] else "Never"} for r in result]}
