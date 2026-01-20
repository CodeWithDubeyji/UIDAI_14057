"""
Update Health Analytics Endpoints (Metrics 6-10)
Schema: biometric(date, state, district, pincode, bio_age_5_17, bio_age_17_)
        demographic(date, state, district, pincode, demo_age_5_17, demo_age_17_)
"""
from fastapi import APIRouter
import sys
sys.path.append('..')
from db.duckdb_loader import get_connection

router = APIRouter(prefix="/metrics", tags=["Update Health"])


@router.get("/biometric-freshness")
def biometric_update_freshness():
    """Metric 6: Days since last biometric update by district"""
    con = get_connection()
    result = con.execute("""
        SELECT district, state,
               ROUND(AVG(CURRENT_DATE - date), 2) AS avg_days,
               MIN(date) AS oldest, MAX(date) AS newest, COUNT(*) AS records
        FROM biometric WHERE date IS NOT NULL
        GROUP BY district, state ORDER BY avg_days DESC
    """).fetchall()
    return {"metric": "biometric_freshness", "data": [
        {"district": r[0], "state": r[1], "avg_days_since_update": r[2],
         "oldest": str(r[3]), "newest": str(r[4]), "records": r[5]} for r in result]}


@router.get("/demographic-staleness")
def demographic_staleness_score():
    """Metric 7: Pincodes without demographic update in >24 months"""
    con = get_connection()
    result = con.execute("""
        WITH enroll_pins AS (SELECT district, state, COUNT(DISTINCT pincode) AS total FROM enrollment GROUP BY district, state),
             stale AS (SELECT e.district, e.state, COUNT(DISTINCT e.pincode) AS stale_count
                       FROM enrollment e LEFT JOIN demographic d ON e.pincode = d.pincode
                       WHERE d.date IS NULL OR d.date < CURRENT_DATE - INTERVAL '24 months'
                       GROUP BY e.district, e.state)
        SELECT ep.district, ep.state, ep.total, COALESCE(s.stale_count, 0),
               ROUND(COALESCE(s.stale_count, 0)::FLOAT / ep.total * 100, 2)
        FROM enroll_pins ep LEFT JOIN stale s ON ep.district = s.district AND ep.state = s.state
        ORDER BY 5 DESC
    """).fetchall()
    return {"metric": "demographic_staleness", "data": [
        {"district": r[0], "state": r[1], "total_pincodes": r[2], "stale": r[3], "staleness_pct": r[4]} for r in result]}


@router.get("/update-dependency-ratio")
def update_dependency_ratio():
    """Metric 8: (bio + demo updates) / enrollments ratio"""
    con = get_connection()
    result = con.execute("""
        WITH enroll_totals AS (SELECT pincode, district, state, (age_0_5 + age_5_17 + age_18_greater) AS total FROM enrollment),
             bio_cnt AS (SELECT pincode, COUNT(*) AS bio FROM biometric GROUP BY pincode),
             demo_cnt AS (SELECT pincode, COUNT(*) AS demo FROM demographic GROUP BY pincode)
        SELECT et.pincode, et.district, et.state, et.total,
               COALESCE(bc.bio, 0), COALESCE(dc.demo, 0),
               CASE WHEN et.total > 0 THEN ROUND((COALESCE(bc.bio, 0) + COALESCE(dc.demo, 0))::FLOAT / et.total, 4) ELSE 0 END
        FROM enroll_totals et LEFT JOIN bio_cnt bc ON et.pincode = bc.pincode
        LEFT JOIN demo_cnt dc ON et.pincode = dc.pincode ORDER BY 7 DESC LIMIT 100
    """).fetchall()
    return {"metric": "update_dependency_ratio", "data": [
        {"pincode": r[0], "district": r[1], "state": r[2], "enrolled": r[3],
         "bio_updates": r[4], "demo_updates": r[5], "ratio": r[6]} for r in result]}


@router.get("/child-adult-transition")
def child_adult_transition_rate():
    """Metric 9: bio_age_17_ / age_5_17 transition rate"""
    con = get_connection()
    result = con.execute("""
        WITH enroll_data AS (SELECT district, state, SUM(age_5_17) AS enrolled_5_17 FROM enrollment GROUP BY district, state),
             bio_data AS (SELECT district, state, SUM(bio_age_17_) AS bio_17 FROM biometric GROUP BY district, state)
        SELECT e.district, e.state, e.enrolled_5_17, COALESCE(b.bio_17, 0),
               CASE WHEN e.enrolled_5_17 > 0 THEN ROUND(COALESCE(b.bio_17, 0)::FLOAT / e.enrolled_5_17, 4) ELSE 0 END
        FROM enroll_data e LEFT JOIN bio_data b ON e.district = b.district AND e.state = b.state ORDER BY 5 DESC
    """).fetchall()
    return {"metric": "child_adult_transition", "data": [
        {"district": r[0], "state": r[1], "enrolled_5_17": r[2], "bio_17_plus": r[3], "transition_rate": r[4]} for r in result]}


@router.get("/multi-update-penalty")
def multi_update_penalty():
    """Metric 10: % pincodes with 3+ updates"""
    con = get_connection()
    result = con.execute("""
        WITH update_cnt AS (
            SELECT e.pincode, e.district, e.state,
                   (SELECT COUNT(*) FROM biometric b WHERE b.pincode = e.pincode) +
                   (SELECT COUNT(*) FROM demographic d WHERE d.pincode = e.pincode) AS total_updates
            FROM enrollment e GROUP BY e.pincode, e.district, e.state
        )
        SELECT district, state, COUNT(*) AS total,
               SUM(CASE WHEN total_updates >= 3 THEN 1 ELSE 0 END) AS high_update,
               ROUND(SUM(CASE WHEN total_updates >= 3 THEN 1 ELSE 0 END)::FLOAT / COUNT(*) * 100, 2)
        FROM update_cnt GROUP BY district, state ORDER BY 5 DESC
    """).fetchall()
    return {"metric": "multi_update_penalty", "data": [
        {"district": r[0], "state": r[1], "total": r[2], "high_update": r[3], "penalty_pct": r[4]} for r in result]}
