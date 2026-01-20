"""
Map Data Endpoints for Geospatial Visualization
Provides state/district/pincode level data for choropleth maps
"""
from fastapi import APIRouter
import sys
sys.path.append('..')
from db.duckdb_loader import get_connection

router = APIRouter(prefix="/map", tags=["Map Data"])


@router.get("/states")
def get_state_data():
    """Get state-level enrollment aggregations for choropleth map"""
    con = get_connection()
    result = con.execute("""
        SELECT 
            state,
            SUM(age_0_5 + age_5_17 + age_18_greater) AS total_enrolled,
            COUNT(DISTINCT district) AS district_count,
            COUNT(DISTINCT pincode) AS pincode_count
        FROM enrollment
        GROUP BY state
        ORDER BY total_enrolled DESC
    """).fetchall()
    
    return {
        "data": [
            {
                "state": r[0],
                "enrolled": int(r[1]) if r[1] else 0,
                "districts": int(r[2]) if r[2] else 0,
                "pincodes": int(r[3]) if r[3] else 0
            }
            for r in result
        ]
    }


@router.get("/districts/{state}")
def get_district_data(state: str):
    """Get district-level data for a specific state"""
    con = get_connection()
    result = con.execute("""
        SELECT 
            district,
            state,
            SUM(age_0_5 + age_5_17 + age_18_greater) AS total_enrolled,
            SUM(age_0_5) AS age_0_5,
            SUM(age_5_17) AS age_5_17,
            SUM(age_18_greater) AS age_18_plus,
            COUNT(DISTINCT pincode) AS pincode_count
        FROM enrollment
        WHERE LOWER(state) = LOWER(?)
        GROUP BY district, state
        ORDER BY total_enrolled DESC
    """, [state]).fetchall()
    
    return {
        "state": state,
        "data": [
            {
                "district": r[0],
                "state": r[1],
                "enrolled": int(r[2]) if r[2] else 0,
                "age_0_5": int(r[3]) if r[3] else 0,
                "age_5_17": int(r[4]) if r[4] else 0,
                "age_18_plus": int(r[5]) if r[5] else 0,
                "pincodes": int(r[6]) if r[6] else 0
            }
            for r in result
        ]
    }


@router.get("/pincodes/{district}")
def get_pincode_data(district: str):
    """Get pincode-level data for a specific district"""
    con = get_connection()
    result = con.execute("""
        SELECT 
            pincode,
            district,
            state,
            (age_0_5 + age_5_17 + age_18_greater) AS total_enrolled,
            age_0_5,
            age_5_17,
            age_18_greater AS age_18_plus
        FROM enrollment
        WHERE LOWER(district) = LOWER(?)
        ORDER BY total_enrolled DESC
    """, [district]).fetchall()
    
    # Generate approximate coordinates based on pincode prefix
    def pincode_to_coords(pincode):
        """Approximate lat/lng from pincode prefix (first 2 digits)"""
        prefix = int(str(pincode)[:2]) if pincode else 11
        # Map pincode prefixes to approximate regions
        lat_base = 8.0 + (prefix / 10) * 2.5  # Range: 8-35
        lng_base = 68.0 + (prefix % 10) * 3.0  # Range: 68-98
        # Add some jitter for visual separation
        import random
        random.seed(pincode)
        lat = lat_base + random.uniform(-0.5, 0.5)
        lng = lng_base + random.uniform(-0.5, 0.5)
        return round(lat, 4), round(lng, 4)
    
    return {
        "district": district,
        "data": [
            {
                "pincode": r[0],
                "district": r[1],
                "state": r[2],
                "enrolled": int(r[3]) if r[3] else 0,
                "age_0_5": int(r[4]) if r[4] else 0,
                "age_5_17": int(r[5]) if r[5] else 0,
                "age_18_plus": int(r[6]) if r[6] else 0,
                "lat": pincode_to_coords(r[0])[0],
                "lng": pincode_to_coords(r[0])[1]
            }
            for r in result
        ]
    }


@router.get("/clusters/{cluster_type}")
def get_cluster_map_data(cluster_type: str):
    """Get cluster data with coordinates for map visualization"""
    con = get_connection()
    
    if cluster_type == "cold":
        # Low enrollment clusters (DBSCAN)
        result = con.execute("""
            SELECT pincode, district, state, (age_0_5 + age_5_17 + age_18_greater) AS total
            FROM enrollment ORDER BY total ASC LIMIT 500
        """).fetchall()
    else:
        # High update clusters (KMeans hot spots)
        result = con.execute("""
            WITH update_cnt AS (
                SELECT e.pincode, e.district, e.state,
                       (SELECT COUNT(*) FROM biometric b WHERE b.pincode = e.pincode) +
                       (SELECT COUNT(*) FROM demographic d WHERE d.pincode = e.pincode) AS updates,
                       (e.age_0_5 + e.age_5_17 + e.age_18_greater) AS enrolled
                FROM enrollment e GROUP BY e.pincode, e.district, e.state
            )
            SELECT pincode, district, state, updates, enrolled
            FROM update_cnt WHERE updates > 0 ORDER BY updates DESC LIMIT 300
        """).fetchall()
    
    def pincode_to_coords(pincode):
        prefix = int(str(pincode)[:2]) if pincode else 11
        lat_base = 8.0 + (prefix / 10) * 2.5
        lng_base = 68.0 + (prefix % 10) * 3.0
        import random
        random.seed(pincode)
        lat = lat_base + random.uniform(-0.8, 0.8)
        lng = lng_base + random.uniform(-0.8, 0.8)
        return round(lat, 4), round(lng, 4)
    
    if cluster_type == "cold":
        return {
            "type": "cold",
            "data": [
                {
                    "pincode": r[0],
                    "district": r[1],
                    "state": r[2],
                    "enrolled": int(r[3]) if r[3] else 0,
                    "lat": pincode_to_coords(r[0])[0],
                    "lng": pincode_to_coords(r[0])[1]
                }
                for r in result
            ]
        }
    else:
        return {
            "type": "hot",
            "data": [
                {
                    "pincode": r[0],
                    "district": r[1],
                    "state": r[2],
                    "updates": int(r[3]) if r[3] else 0,
                    "enrolled": int(r[4]) if r[4] else 0,
                    "lat": pincode_to_coords(r[0])[0],
                    "lng": pincode_to_coords(r[0])[1]
                }
                for r in result
            ]
        }
