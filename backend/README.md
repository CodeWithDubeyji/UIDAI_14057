# Aadhaar Insight API - Complete Backend

Complete FastAPI backend for UIDAI Aadhaar data analysis with 32+ analytics endpoints plus ML-based trend analysis.

## Features

- **32 Core Analytics Endpoints** - Comprehensive metrics across 7 categories
- **ML-Powered Trend Analysis** - Predictive analytics with fraud detection
- **DuckDB Integration** - Fast analytical queries
- **Real-time Insights** - State, district, and pincode-level analysis

## Quick Start

### Prerequisites
- Python 3.12+
- pip or uv package manager

### Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Or using uv (faster)
uv sync
```

### Running the Server

```bash
# Start the FastAPI server
python main.py

# Or with uvicorn directly
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Visit http://127.0.0.1:8000/docs for interactive API documentation.

## API Endpoints

### Core Analytics (32 Metrics)

#### Data Insights (Metrics 1-5)
- `/metrics/enrollment-deficit-ratio` - Enrollment gaps analysis
- `/metrics/age-cohort-imbalance` - Age distribution analysis
- `/metrics/rural-urban-disparity` - Geographic disparities
- `/metrics/pincode-gini` - Inequality coefficient
- `/metrics/demographic-deserts` - Underserved areas

#### Update Health (Metrics 6-10)
- `/metrics/biometric-freshness` - Recent biometric updates
- `/metrics/demographic-staleness` - Outdated demographic data
- `/metrics/update-dependency-ratio` - Update patterns
- `/metrics/child-adult-transition` - Age transition tracking
- `/metrics/multi-update-penalty` - Update frequency analysis

#### Geospatial Analysis (Metrics 11-15)
- `/metrics/enrollment-cold-clusters` - Low enrollment areas
- `/metrics/update-hot-clusters` - High activity zones
- `/metrics/moran-i` - Spatial autocorrelation
- `/metrics/contiguity-ratio` - Geographic connectivity
- `/metrics/enrollment-density-variance` - Distribution analysis

#### Temporal Analysis (Metrics 16-20)
- `/metrics/monsoon-fingerprint-spike` - Seasonal patterns
- `/metrics/enrollment-velocity` - Rate of change
- `/metrics/update-seasonality-index` - Seasonal trends
- `/metrics/weekend-effect` - Day-of-week patterns
- `/metrics/cohort-aging-progress` - Age progression tracking

#### Anomaly Detection (Metrics 21-25)
- `/metrics/enrollment-zscore` - Statistical outliers
- `/metrics/bulk-enrollment-days` - Mass enrollment events
- `/metrics/orphan-updates` - Unmatched records
- `/metrics/age-distribution-skew` - Distribution anomalies
- `/metrics/population-mismatch` - Census discrepancies

#### Composite Metrics (Metrics 26-27)
- `/metrics/aadhaar-health-index` - Overall system health
- `/metrics/exclusion-risk-index` - Coverage risk assessment

#### Advanced Insights (Metrics 28-32)
- `/metrics/monsoon-fingerprint-index` - Climate impact analysis
- `/metrics/enrollment-mirage` - Data quality issues
- `/metrics/phantom-children` - Missing child enrollments
- `/metrics/district-twins` - Similar district patterns
- `/metrics/pincode-ghost-towns` - Inactive areas

### ML-Based Trend Analysis

#### Summary & Dashboard
- **GET** `/api/trends/summary`
  - Overall system statistics
  - Completion rates (demographics, biometrics)
  - Coverage metrics (states, districts)
  - Date range and fraud alerts

#### Predictive Analytics
- **GET** `/api/trends/forecast`
  - 7-day biometric workload prediction
  - ML-based linear regression model
  - Helps with resource planning

#### Enrollment Trends
- **GET** `/api/trends/enrollment-by-age`
  - Daily enrollment breakdown by age groups
  - Tracks 0-5, 5-17, and 18+ cohorts
  - Time series data for visualization

- **GET** `/api/trends/daily-volume`
  - Daily volumes: enrollments, demographics, biometrics
  - Capacity planning insights
  - Peak day identification

#### Performance Analysis
- **GET** `/api/trends/state-performance`
  - State-wise enrollment statistics
  - Completion rates comparison
  - Pending backlogs by state
  - Performance ranking

- **GET** `/api/trends/bottleneck-districts`
  - Districts with <80% completion rates
  - Identifies demographic vs biometric bottlenecks
  - Prioritized by enrollment volume
  - Top 20 problem areas

#### Hotspot Identification
- **GET** `/api/trends/high-volume-pincodes`
  - Top 30 pincodes by enrollment
  - Detailed age group breakdown
  - Resource deployment planning

#### Fraud Detection
- **GET** `/api/trends/fraud/anomalies`
  - Districts with unusual enrollment spikes
  - Anomaly scores using Isolation Forest ML
  - Potential fraud pattern detection
  - Last detection timestamps

## Data Structure

The backend expects data in CSV format in the `data/` directory:

### Enrollment Data (`enrollment_*.csv`)
```csv
date,state,district,pincode,age_0_5,age_5_17,age_18_greater
31-12-2025,Karnataka,Bidar,585330,2,3,0
```

### Demographic Data (`demographic_*.csv`)
```csv
date,state,district,pincode,demo_age_5_17,demo_age_17_
16-12-2025,Madhya Pradesh,Shajapur,465113,0,4
```

### Biometric Data (`biomterics_*.csv`)
```csv
date,state,district,pincode,bio_age_5_17,bio_age_17_
08-12-2025,Uttar Pradesh,Moradabad,244411,4,2
```

## Project Structure

```
backend/
├── main.py                 # FastAPI app entry point
├── requirements.txt        # Python dependencies
├── routes/                 # API route modules
│   ├── data_insights.py
│   ├── update_health.py
│   ├── geospatial.py
│   ├── temporal.py
│   ├── anomaly.py
│   ├── composite.py
│   ├── crazy_insights.py
│   └── trend_analyser.py  # ML-based trend analysis
├── db/                     # Database utilities
│   └── duckdb_loader.py
└── data/                   # CSV data files
    ├── enrollment_*.csv
    ├── demographic_*.csv
    └── biomterics_*.csv
```

## Technologies Used

- **FastAPI** - Modern Python web framework
- **DuckDB** - In-memory analytical database
- **Pandas** - Data manipulation and analysis
- **Scikit-learn** - Machine learning (Isolation Forest, Linear Regression)
- **NumPy** - Numerical computing

## Use Cases for Officials

1. **Resource Allocation** - Identify bottleneck districts and high-volume pincodes
2. **Fraud Detection** - ML-powered anomaly detection for suspicious patterns
3. **Capacity Planning** - Predictive forecasting for biometric workload
4. **Performance Monitoring** - State and district completion rate tracking
5. **Trend Analysis** - Historical enrollment patterns by age groups
6. **Strategic Planning** - Comprehensive system health metrics

## Development

```bash
# Run with auto-reload
uvicorn main:app --reload

# Run with custom host/port
uvicorn main:app --host 0.0.0.0 --port 8080
```

## API Documentation

- **Swagger UI**: http://127.0.0.1:8000/docs
- **ReDoc**: http://127.0.0.1:8000/redoc

## License

MIT License
