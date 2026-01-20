"""
Composite Indices Endpoints (Metrics 26-27)
"""
from fastapi import APIRouter
import sys
sys.path.append('..')
from db.duckdb_loader import get_connection

router = APIRouter(prefix="/metrics", tags=["Composite Indices"])


@router.get("/aadhaar-health-index")
def aadhaar_health_index():
    """
    Metric 26: Aadhaar Health Index
    A composite score measuring overall Aadhaar ecosystem health in a district.
    Components: Enrollment Volume (40%) + Data Freshness (30%) + Update Activity (30%)
    Higher score = healthier ecosystem
    """
    con = get_connection()
    
    # Step 1: Get coverage data
    coverage = con.execute("""
        SELECT district, state, SUM(age_0_5 + age_5_17 + age_18_greater) AS total_enrolled
        FROM enrollment GROUP BY district, state
    """).fetchdf()
    
    if coverage.empty:
        return {"metric": "aadhaar_health_index", "description": "No data available", "data": []}
    
    max_enrolled = coverage['total_enrolled'].max()
    
    # Step 2: Get freshness scores
    freshness = con.execute("""
        SELECT district, state, 
               1.0 - (AVG(CURRENT_DATE - date)::FLOAT / 365.0) AS fresh_score
        FROM biometric WHERE date IS NOT NULL 
        GROUP BY district, state
    """).fetchdf()
    
    # Step 3: Get update counts
    update_bio = con.execute("""
        SELECT district, state, COUNT(*) AS bio_updates FROM biometric GROUP BY district, state
    """).fetchdf()
    
    update_demo = con.execute("""
        SELECT district, state, COUNT(*) AS demo_updates FROM demographic GROUP BY district, state
    """).fetchdf()
    
    # Merge in Python
    fresh_dict = {(r['district'], r['state']): r['fresh_score'] for _, r in freshness.iterrows()} if not freshness.empty else {}
    bio_dict = {(r['district'], r['state']): r['bio_updates'] for _, r in update_bio.iterrows()} if not update_bio.empty else {}
    demo_dict = {(r['district'], r['state']): r['demo_updates'] for _, r in update_demo.iterrows()} if not update_demo.empty else {}
    
    results = []
    for _, row in coverage.iterrows():
        key = (row['district'], row['state'])
        enrolled = row['total_enrolled']
        fresh_score = max(0, min(1, fresh_dict.get(key, 0)))
        updates = bio_dict.get(key, 0) + demo_dict.get(key, 0)
        update_ratio = min(1, updates / enrolled) if enrolled > 0 else 0
        
        freshness_pct = round(fresh_score * 100, 2)
        update_pct = round(update_ratio * 100, 2)
        health_index = round((0.4 * (enrolled / max_enrolled) + 0.3 * fresh_score + 0.3 * update_ratio) * 100, 2)
        
        results.append({
            "district": row['district'],
            "state": row['state'],
            "enrolled": int(enrolled),
            "freshness_pct": freshness_pct,
            "update_pct": update_pct,
            "health_index": health_index
        })
    
    results.sort(key=lambda x: x['health_index'], reverse=True)
    
    return {
        "metric": "aadhaar_health_index",
        "description": "Composite score: Enrollment Volume (40%) + Data Freshness (30%) + Update Activity (30%). Higher = better.",
        "data": results
    }


@router.get("/exclusion-risk-index")
def exclusion_risk_index():
    """
    Metric 27: Exclusion Risk Index
    Measures the risk of residents being excluded from Aadhaar-linked services.
    Components: Enrollment Deficit (40%) + Data Staleness (35%) + Update Deserts (25%)
    Higher score = higher risk of exclusion
    """
    con = get_connection()
    
    # Step 1: Get enrollment totals
    enrollment = con.execute("""
        SELECT district, state, SUM(age_0_5 + age_5_17 + age_18_greater) AS total
        FROM enrollment GROUP BY district, state
    """).fetchdf()
    
    if enrollment.empty:
        return {"metric": "exclusion_risk_index", "description": "No data available", "data": []}
    
    max_enrolled = enrollment['total'].max()
    
    # Step 2: Get staleness (pincodes with old demographic data)
    staleness = con.execute("""
        SELECT e.district, e.state,
               COUNT(CASE WHEN d.date IS NULL OR d.date < CURRENT_DATE - INTERVAL '24 months' THEN 1 END)::FLOAT / 
               NULLIF(COUNT(*), 0) AS stale_ratio
        FROM enrollment e 
        LEFT JOIN demographic d ON e.pincode = d.pincode 
        GROUP BY e.district, e.state
    """).fetchdf()
    
    # Step 3: Get update deserts (pincodes with no recent activity)
    deserts = con.execute("""
        SELECT e.district, e.state,
               COUNT(DISTINCT e.pincode) AS total_pincodes,
               COUNT(DISTINCT CASE WHEN d.date >= CURRENT_DATE - INTERVAL '12 months' THEN e.pincode END) AS active_pincodes
        FROM enrollment e 
        LEFT JOIN demographic d ON e.pincode = d.pincode 
        GROUP BY e.district, e.state
    """).fetchdf()
    
    stale_dict = {(r['district'], r['state']): r['stale_ratio'] for _, r in staleness.iterrows()} if not staleness.empty else {}
    desert_dict = {}
    if not deserts.empty:
        for _, r in deserts.iterrows():
            total = r['total_pincodes']
            active = r['active_pincodes']
            desert_dict[(r['district'], r['state'])] = (total - active) / total if total > 0 else 0
    
    results = []
    for _, row in enrollment.iterrows():
        key = (row['district'], row['state'])
        total = row['total']
        
        deficit = max(0, 1.0 - (total / max_enrolled))
        stale_ratio = stale_dict.get(key, 0) or 0
        desert_ratio = desert_dict.get(key, 0) or 0
        
        deficit_pct = round(deficit * 100, 2)
        staleness_pct = round(stale_ratio * 100, 2)
        desert_pct = round(desert_ratio * 100, 2)
        exclusion_risk = round((deficit * 0.4 + stale_ratio * 0.35 + desert_ratio * 0.25) * 100, 2)
        
        results.append({
            "district": row['district'],
            "state": row['state'],
            "deficit_pct": deficit_pct,
            "staleness_pct": staleness_pct,
            "desert_pct": desert_pct,
            "exclusion_risk": exclusion_risk
        })
    
    results.sort(key=lambda x: x['exclusion_risk'], reverse=True)
    
    return {
        "metric": "exclusion_risk_index",
        "description": "Risk score: Enrollment Deficit (40%) + Data Staleness (35%) + Update Deserts (25%). Higher = more at risk.",
        "data": results
    }
