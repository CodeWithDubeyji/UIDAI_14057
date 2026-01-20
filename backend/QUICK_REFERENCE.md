# 🚀 Quick Reference - Trend Analyser Endpoints

## Start Server
```bash
cd backend
python run.py
```

## Base URL
```
http://127.0.0.1:8000
```

## Trend Analysis Endpoints

### 1. Dashboard Summary
**GET** `/api/trends/summary`

Returns overall statistics including:
- Total enrollments
- Demographic completion rate
- Biometric completion rate
- Fraud cases detected
- Districts and states covered
- Date range

**Example Response:**
```json
{
  "total_enrollment": 150000,
  "demographic_completion_rate": 85.5,
  "biometric_completion_rate": 78.2,
  "fraud_cases": 42,
  "districts_covered": 156,
  "states_covered": 12,
  "date_range": {
    "start": "2025-12-08",
    "end": "2025-12-31"
  }
}
```

### 2. 7-Day Forecast
**GET** `/api/trends/forecast`

ML prediction for next 7 days biometric load.

**Example Response:**
```json
[
  {"date": "2026-01-01", "predicted_biometric_load": 1250},
  {"date": "2026-01-02", "predicted_biometric_load": 1320},
  ...
]
```

### 3. Enrollment by Age
**GET** `/api/trends/enrollment-by-age`

Daily enrollment breakdown by age groups.

### 4. State Performance
**GET** `/api/trends/state-performance`

State-wise comparison with completion rates.

**Example Response:**
```json
[
  {
    "state": "Uttar Pradesh",
    "total_enrolled": 45000,
    "demographic_rate": 88.5,
    "biometric_rate": 82.1,
    "pending_demographics": 5175,
    "pending_biometrics": 8055
  },
  ...
]
```

### 5. Bottleneck Districts
**GET** `/api/trends/bottleneck-districts`

Districts with <80% completion rates.

**Example Response:**
```json
[
  {
    "state": "Madhya Pradesh",
    "district": "Singrauli",
    "total_enrolled": 1250,
    "demographic_rate": 72.5,
    "biometric_rate": 65.8,
    "issue": "Biometric Backlog"
  },
  ...
]
```

### 6. Daily Volume
**GET** `/api/trends/daily-volume`

Daily time series for enrollments, demographics, biometrics.

### 7. High Volume Pincodes
**GET** `/api/trends/high-volume-pincodes`

Top 30 pincodes by enrollment volume.

**Example Response:**
```json
[
  {
    "pincode": 262001,
    "district": "Pilibhit",
    "state": "Uttar Pradesh",
    "total_enrollments": 2580,
    "children_0_5": 450,
    "children_5_17": 820,
    "adults": 1310
  },
  ...
]
```

### 8. Fraud Anomalies
**GET** `/api/trends/fraud/anomalies`

ML-detected suspicious enrollment patterns.

**Example Response:**
```json
[
  {
    "state": "Karnataka",
    "district": "Bidar",
    "adult_enrollments": 850,
    "anomaly_score": 3.45,
    "last_detected": "2025-12-31"
  },
  ...
]
```

## Quick Test Commands

```bash
# Health check
curl http://127.0.0.1:8000/

# List all endpoints
curl http://127.0.0.1:8000/metrics

# Get summary
curl http://127.0.0.1:8000/api/trends/summary

# Get forecast
curl http://127.0.0.1:8000/api/trends/forecast

# Find bottlenecks
curl http://127.0.0.1:8000/api/trends/bottleneck-districts

# Detect fraud
curl http://127.0.0.1:8000/api/trends/fraud/anomalies
```

## Interactive Documentation

Visit: http://127.0.0.1:8000/docs

Try out all endpoints with Swagger UI!

## Key Features

✅ **Predictive Analytics** - 7-day ML forecasting
✅ **Fraud Detection** - Isolation Forest algorithm
✅ **Performance Tracking** - State/district comparison
✅ **Bottleneck Identification** - Resource allocation guidance
✅ **Hotspot Analysis** - High-volume area detection
✅ **Real-time Insights** - Live data processing

## ML Models Used

1. **Linear Regression** - Trend forecasting
2. **Isolation Forest** - Anomaly detection

Models train automatically on first request and stay in memory.

## Data Sources

- **Enrollment Data** - 3 files (age-wise enrollment)
- **Demographic Data** - 5 files (demographic updates)
- **Biometric Data** - 4 files (biometric captures)

Total: 12 CSV files in `backend/data/` directory

## Status Indicators

- 🟢 **>80% completion** - Healthy
- 🟡 **60-80% completion** - Attention needed
- 🔴 **<60% completion** - Critical

## Support

For detailed documentation, see:
- `backend/README.md` - Full API documentation
- `backend/SETUP_GUIDE.md` - Setup instructions
- `README.md` - Project overview
