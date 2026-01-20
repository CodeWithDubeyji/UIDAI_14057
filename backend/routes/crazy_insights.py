"""
Crazy Insights Endpoints (Metrics 28-32)
"""
from fastapi import APIRouter
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import sys
sys.path.append('..')
from db.duckdb_loader import get_connection

router = APIRouter(prefix="/metrics", tags=["Crazy Insights"])


@router.get("/monsoon-fingerprint-index")
def monsoon_fingerprint_index():
    """Metric 28: Monsoon bio updates vs rest of year"""
    con = get_connection()
    result = con.execute("""
        WITH monthly AS (
            SELECT state, EXTRACT(MONTH FROM date) AS month, COUNT(*) AS updates
            FROM biometric WHERE date IS NOT NULL GROUP BY state, EXTRACT(MONTH FROM date)
        ),
        monsoon AS (SELECT state, SUM(updates) AS monsoon FROM monthly WHERE month IN (6,7,8,9) GROUP BY state),
        non_monsoon AS (SELECT state, SUM(updates) AS non_monsoon FROM monthly WHERE month NOT IN (6,7,8,9) GROUP BY state)
        SELECT m.state, m.monsoon, n.non_monsoon,
               ROUND(m.monsoon::FLOAT / NULLIF(n.non_monsoon, 0), 2) AS ratio,
               CASE WHEN m.monsoon::FLOAT / NULLIF(n.non_monsoon, 0) > 1.2 THEN 'High Impact'
                    WHEN m.monsoon::FLOAT / NULLIF(n.non_monsoon, 0) < 0.8 THEN 'Low Impact' ELSE 'Normal' END
        FROM monsoon m JOIN non_monsoon n ON m.state = n.state ORDER BY ratio DESC
    """).fetchall()
    return {"metric": "monsoon_fingerprint_index", "data": [
        {"state": r[0], "monsoon": r[1], "non_monsoon": r[2], "ratio": r[3], "impact": r[4]} for r in result]}


@router.get("/enrollment-mirage")
def enrollment_mirage():
    """Metric 29: High enrollments but low update activity"""
    con = get_connection()
    result = con.execute("""
        WITH enroll_totals AS (SELECT pincode, district, state, (age_0_5 + age_5_17 + age_18_greater) AS enrolled FROM enrollment),
             update_cnt AS (
                 SELECT e.pincode, (SELECT COUNT(*) FROM biometric b WHERE b.pincode = e.pincode) +
                        (SELECT COUNT(*) FROM demographic d WHERE d.pincode = e.pincode) AS updates
                 FROM enrollment e GROUP BY e.pincode
             )
        SELECT et.pincode, et.district, et.state, et.enrolled, COALESCE(uc.updates, 0),
               ROUND(COALESCE(uc.updates, 0)::FLOAT / NULLIF(et.enrolled, 0), 4)
        FROM enroll_totals et LEFT JOIN update_cnt uc ON et.pincode = uc.pincode
        WHERE et.enrolled > 500 AND COALESCE(uc.updates, 0)::FLOAT / NULLIF(et.enrolled, 0) < 0.05
        ORDER BY et.enrolled DESC LIMIT 50
    """).fetchall()
    return {"metric": "enrollment_mirage", "data": [
        {"pincode": r[0], "district": r[1], "state": r[2], "enrolled": r[3], "updates": r[4], "ratio": r[5]} for r in result]}


@router.get("/phantom-children")
def phantom_children():
    """Metric 30: Age 0-5 enrollments without biometric updates"""
    con = get_connection()
    result = con.execute("""
        WITH child_enroll AS (SELECT district, state, SUM(age_0_5) AS children FROM enrollment GROUP BY district, state),
             child_bio AS (SELECT district, state, SUM(bio_age_5_17) AS bio_children FROM biometric GROUP BY district, state)
        SELECT c.district, c.state, c.children, COALESCE(b.bio_children, 0),
               c.children - COALESCE(b.bio_children, 0) AS phantom,
               ROUND((c.children - COALESCE(b.bio_children, 0))::FLOAT / NULLIF(c.children, 0) * 100, 2)
        FROM child_enroll c LEFT JOIN child_bio b ON c.district = b.district AND c.state = b.state
        WHERE c.children > COALESCE(b.bio_children, 0) ORDER BY phantom DESC
    """).fetchall()
    return {"metric": "phantom_children", "data": [
        {"district": r[0], "state": r[1], "enrolled": r[2], "bio_updated": r[3], "phantom": r[4], "pct": r[5]} for r in result]}


@router.get("/district-twins")
def district_twins():
    """Metric 31: Districts with similar metric profiles"""
    con = get_connection()
    result = con.execute("""
        SELECT district, state,
               SUM(age_0_5)::FLOAT / NULLIF(SUM(age_0_5 + age_5_17 + age_18_greater), 0) AS r1,
               SUM(age_5_17)::FLOAT / NULLIF(SUM(age_0_5 + age_5_17 + age_18_greater), 0) AS r2,
               SUM(age_18_greater)::FLOAT / NULLIF(SUM(age_0_5 + age_5_17 + age_18_greater), 0) AS r3
        FROM enrollment GROUP BY district, state
    """).fetchall()
    if len(result) < 2:
        return {"metric": "district_twins", "message": "Insufficient data"}
    districts = [(r[0], r[1]) for r in result]
    features = np.array([[r[2] or 0, r[3] or 0, r[4] or 0] for r in result])
    sim = cosine_similarity(features)
    np.fill_diagonal(sim, 0)
    twins = []
    for i in range(len(districts)):
        j = np.argmax(sim[i])
        if sim[i][j] > 0.995:
            twins.append({"d1": districts[i][0], "s1": districts[i][1], "d2": districts[j][0], "s2": districts[j][1], "sim": round(float(sim[i][j]), 4)})
    return {"metric": "district_twins", "twins": twins[:20]}


@router.get("/pincode-ghost-towns")
def pincode_ghost_towns():
    """Metric 32: Pincodes with no activity for 2+ years"""
    con = get_connection()
    result = con.execute("""
        WITH latest_bio AS (SELECT pincode, MAX(date) AS last_bio FROM biometric GROUP BY pincode),
             latest_demo AS (SELECT pincode, MAX(date) AS last_demo FROM demographic GROUP BY pincode)
        SELECT e.pincode, e.district, e.state, (e.age_0_5 + e.age_5_17 + e.age_18_greater) AS enrolled,
               lb.last_bio, ld.last_demo,
               GREATEST(COALESCE(lb.last_bio, '1900-01-01'), COALESCE(ld.last_demo, '1900-01-01')) AS last_activity
        FROM enrollment e LEFT JOIN latest_bio lb ON e.pincode = lb.pincode LEFT JOIN latest_demo ld ON e.pincode = ld.pincode
        WHERE GREATEST(COALESCE(lb.last_bio, '1900-01-01'), COALESCE(ld.last_demo, '1900-01-01')) < CURRENT_DATE - INTERVAL '2 years'
        ORDER BY enrolled DESC LIMIT 100
    """).fetchall()
    return {"metric": "pincode_ghost_towns", "count": len(result), "data": [
        {"pincode": r[0], "district": r[1], "state": r[2], "enrolled": r[3],
         "last_bio": str(r[4]) if r[4] else None, "last_demo": str(r[5]) if r[5] else None} for r in result]}
