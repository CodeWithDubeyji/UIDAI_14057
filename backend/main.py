"""
Aadhaar Insight API - Main Application
FastAPI backend with 32 analytics endpoints for UIDAI data analysis
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.duckdb_loader import load_data, get_connection

# Import all route modules
from routes.data_insights import router as data_insights_router
from routes.update_health import router as update_health_router
from routes.geospatial import router as geospatial_router
from routes.temporal import router as temporal_router
from routes.anomaly import router as anomaly_router
from routes.composite import router as composite_router
from routes.crazy_insights import router as crazy_insights_router
from routes.trend_analyser import router as trend_analyser_router
from routes.map_data import router as map_data_router

app = FastAPI(
    title="Aadhaar Insight API",
    description="Analytics endpoints for UIDAI Aadhaar data - 32 metrics across 7 categories",
    version="1.0.0"
)

# CORS middleware for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(data_insights_router)      # Metrics 1-5
app.include_router(update_health_router)      # Metrics 6-10
app.include_router(geospatial_router)         # Metrics 11-15
app.include_router(temporal_router)           # Metrics 16-20
app.include_router(anomaly_router)            # Metrics 21-25
app.include_router(composite_router)          # Metrics 26-27
app.include_router(crazy_insights_router)     # Metrics 28-32
app.include_router(trend_analyser_router)     # ML-based Trend Analysis
app.include_router(map_data_router)           # Map visualization data


@app.on_event("startup")
def startup():
    """Load data into DuckDB on startup"""
    load_data()


@app.get("/")
def home():
    """Health check endpoint"""
    return {
        "status": "Aadhaar Complete Backend API Running", 
        "core_endpoints": 32,
        "trend_analysis_endpoints": 9,
        "total_endpoints": 41
    }


@app.get("/metrics")
def list_all_metrics():
    """List all available metrics endpoints"""
    return {
        "total_endpoints": 41,
        "categories": {
            "data_insights": [
                "/metrics/enrollment-deficit-ratio",
                "/metrics/age-cohort-imbalance",
                "/metrics/rural-urban-disparity",
                "/metrics/pincode-gini",
                "/metrics/demographic-deserts"
            ],
            "update_health": [
                "/metrics/biometric-freshness",
                "/metrics/demographic-staleness",
                "/metrics/update-dependency-ratio",
                "/metrics/child-adult-transition",
                "/metrics/multi-update-penalty"
            ],
            "geospatial": [
                "/metrics/enrollment-cold-clusters",
                "/metrics/update-hot-clusters",
                "/metrics/moran-i",
                "/metrics/contiguity-ratio",
                "/metrics/enrollment-density-variance"
            ],
            "temporal": [
                "/metrics/monsoon-fingerprint-spike",
                "/metrics/enrollment-velocity",
                "/metrics/update-seasonality-index",
                "/metrics/weekend-effect",
                "/metrics/cohort-aging-progress"
            ],
            "anomaly": [
                "/metrics/enrollment-zscore",
                "/metrics/bulk-enrollment-days",
                "/metrics/orphan-updates",
                "/metrics/age-distribution-skew",
                "/metrics/population-mismatch"
            ],
            "composite": [
                "/metrics/aadhaar-health-index",
                "/metrics/exclusion-risk-index"
            ],
            "crazy_insights": [
                "/metrics/monsoon-fingerprint-index",
                "/metrics/enrollment-mirage",
                "/metrics/phantom-children",
                "/metrics/district-twins",
                "/metrics/pincode-ghost-towns"
            ],
            "trend_analysis": [
                "/api/trends/summary",
                "/api/trends/forecast",
                "/api/trends/enrollment-by-age",
                "/api/trends/state-performance",
                "/api/trends/bottleneck-districts",
                "/api/trends/daily-volume",
                "/api/trends/high-volume-pincodes",
                "/api/trends/fraud/anomalies"
            ]
        }
    }


@app.get("/enrollments_by_state")
def enrollments_by_state():
    """Original endpoint - enrollments aggregated by state"""
    con = get_connection()
    result = con.execute("""
        SELECT state, COUNT(*) AS total_enrollments
        FROM enrollment
        GROUP BY state
        ORDER BY total_enrollments DESC
    """).fetchall()
    return result
