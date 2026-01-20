"""
Temporal Analytics Endpoints (Metrics 16-20)
"""
from fastapi import APIRouter
import sys
sys.path.append('..')
from db.duckdb_loader import get_connection

router = APIRouter(prefix="/metrics", tags=["Temporal"])


@router.get("/monsoon-fingerprint-spike")
def monsoon_fingerprint_spike():
    """Metric 16: Jul-Aug bio updates / annual avg"""
    con = get_connection()
    result = con.execute("""
        WITH monthly AS (
            SELECT state, EXTRACT(YEAR FROM date) AS year, EXTRACT(MONTH FROM date) AS month, COUNT(*) AS cnt
            FROM biometric WHERE date IS NOT NULL GROUP BY state, EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date)
        ),
        annual AS (SELECT state, year, AVG(cnt) AS avg_monthly FROM monthly GROUP BY state, year),
        monsoon AS (SELECT state, year, SUM(cnt) AS monsoon_total FROM monthly WHERE month IN (7, 8) GROUP BY state, year)
        SELECT a.state, a.year, ROUND(a.avg_monthly, 2), COALESCE(m.monsoon_total, 0),
               CASE WHEN a.avg_monthly > 0 THEN ROUND((COALESCE(m.monsoon_total, 0) / 2.0) / a.avg_monthly, 2) ELSE 0 END
        FROM annual a LEFT JOIN monsoon m ON a.state = m.state AND a.year = m.year ORDER BY 5 DESC
    """).fetchall()
    return {"metric": "monsoon_fingerprint_spike", "data": [
        {"state": r[0], "year": int(r[1]) if r[1] else None, "avg_monthly": r[2], "jul_aug": r[3], "spike_ratio": r[4]} for r in result]}


@router.get("/enrollment-velocity")
def enrollment_velocity():
    """Metric 17: Monthly enrollment growth rate by state"""
    con = get_connection()
    result = con.execute("""
        WITH monthly AS (
            SELECT state, DATE_TRUNC('month', date) AS month, SUM(age_0_5 + age_5_17 + age_18_greater) AS total
            FROM enrollment WHERE date IS NOT NULL GROUP BY state, DATE_TRUNC('month', date)
        ),
        with_lag AS (
            SELECT state, month, total, LAG(total) OVER (PARTITION BY state ORDER BY month) AS prev FROM monthly
        )
        SELECT state, month, total, prev, CASE WHEN prev > 0 THEN ROUND((total - prev)::FLOAT / prev * 100, 2) ELSE NULL END
        FROM with_lag WHERE prev IS NOT NULL ORDER BY state, month DESC
    """).fetchall()
    return {"metric": "enrollment_velocity", "data": [
        {"state": r[0], "month": str(r[1]), "total": r[2], "prev": r[3], "growth_pct": r[4]} for r in result[:100]]}


@router.get("/update-seasonality-index")
def update_seasonality_index():
    """Metric 18: max monthly updates / min monthly updates"""
    con = get_connection()
    result = con.execute("""
        WITH monthly AS (
            SELECT state, EXTRACT(MONTH FROM date) AS month, COUNT(*) AS cnt
            FROM biometric WHERE date IS NOT NULL GROUP BY state, EXTRACT(MONTH FROM date)
        )
        SELECT state, MAX(cnt), MIN(cnt), ROUND(AVG(cnt), 2),
               CASE WHEN MIN(cnt) > 0 THEN ROUND(MAX(cnt)::FLOAT / MIN(cnt), 2) ELSE NULL END
        FROM monthly GROUP BY state ORDER BY 5 DESC NULLS LAST
    """).fetchall()
    return {"metric": "update_seasonality_index", "data": [
        {"state": r[0], "max": r[1], "min": r[2], "avg": r[3], "seasonality_index": r[4]} for r in result]}


@router.get("/weekend-effect")
def weekend_effect():
    """Metric 19: Weekend vs weekday enrollments"""
    con = get_connection()
    result = con.execute("""
        WITH cat AS (
            SELECT state, CASE WHEN EXTRACT(DOW FROM date) IN (0, 6) THEN 'weekend' ELSE 'weekday' END AS day_type,
                   SUM(age_0_5 + age_5_17 + age_18_greater) AS total, COUNT(DISTINCT date) AS days
            FROM enrollment WHERE date IS NOT NULL
            GROUP BY state, CASE WHEN EXTRACT(DOW FROM date) IN (0, 6) THEN 'weekend' ELSE 'weekday' END
        ),
        piv AS (
            SELECT state, MAX(CASE WHEN day_type='weekend' THEN total/NULLIF(days,0) END) AS we,
                   MAX(CASE WHEN day_type='weekday' THEN total/NULLIF(days,0) END) AS wd FROM cat GROUP BY state
        )
        SELECT state, ROUND(we, 2), ROUND(wd, 2), ROUND(we - wd, 2),
               CASE WHEN wd > 0 THEN ROUND((we - wd) / wd * 100, 2) ELSE NULL END
        FROM piv WHERE we IS NOT NULL AND wd IS NOT NULL ORDER BY 5 DESC NULLS LAST
    """).fetchall()
    return {"metric": "weekend_effect", "data": [
        {"state": r[0], "weekend_avg": r[1], "weekday_avg": r[2], "diff": r[3], "effect_pct": r[4]} for r in result]}


@router.get("/cohort-aging-progress")
def cohort_aging_progress():
    """Metric 20: Enrollment vs biometric age distribution"""
    con = get_connection()
    enroll = con.execute("""
        SELECT state, SUM(age_0_5) AS a0, SUM(age_5_17) AS a5, SUM(age_18_greater) AS a18,
               SUM(age_0_5 + age_5_17 + age_18_greater) AS total
        FROM enrollment GROUP BY state
    """).fetchall()
    bio = con.execute("""
        SELECT state, SUM(bio_age_5_17) AS b5, SUM(bio_age_17_) AS b17
        FROM biometric GROUP BY state
    """).fetchall()
    bio_dict = {r[0]: r for r in bio}
    data = []
    for e in enroll:
        b = bio_dict.get(e[0], (e[0], 0, 0))
        if e[4] and e[4] > 0:
            data.append({"state": e[0],
                         "enroll_pct_0_5": round(e[1] / e[4] * 100, 2) if e[1] else 0,
                         "enroll_pct_5_17": round(e[2] / e[4] * 100, 2) if e[2] else 0,
                         "enroll_pct_18": round(e[3] / e[4] * 100, 2) if e[3] else 0,
                         "bio_5_17": b[1], "bio_17_plus": b[2]})
    return {"metric": "cohort_aging_progress", "data": data}
