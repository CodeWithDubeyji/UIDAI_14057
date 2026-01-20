# UIDAI Aadhaar Analytics System

Complete full-stack system for Aadhaar enrollment data analysis with 41 powerful endpoints.

## 🎯 System Overview

This project provides comprehensive analytics for UIDAI Aadhaar enrollment data, including:

- **32 Core Analytics Metrics** - Statistical analysis across 7 categories
- **9 ML-Powered Trend Analysis Endpoints** - Predictive analytics and fraud detection
- **Full-Stack Solution** - Backend API + Frontend Dashboard
- **Real-time Insights** - State, district, and pincode-level analysis

## 📦 Project Structure

```
UIDAI_14057/
├── backend/              # FastAPI backend (Complete & Ready)
│   ├── main.py          # API entry point
│   ├── run.py           # Quick start script
│   ├── routes/          # 8 route modules (41 endpoints)
│   ├── db/              # DuckDB integration
│   ├── data/            # CSV datasets (12 files included)
│   ├── requirements.txt # Python dependencies
│   ├── README.md        # Backend documentation
│   └── SETUP_GUIDE.md   # Setup instructions
│
└── frontend/            # Frontend dashboard
    └── [Frontend files]
```

## 🚀 Quick Start

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Start the server
python run.py
```

Server will be available at:
- **API**: http://127.0.0.1:8000
- **Docs**: http://127.0.0.1:8000/docs

### Frontend Setup

```bash
cd frontend
# [Frontend setup instructions]
```

## 🎨 Features

### Core Analytics (32 Metrics)

1. **Data Insights** - Enrollment gaps, age distribution, geographic disparities
2. **Update Health** - Biometric freshness, demographic staleness tracking
3. **Geospatial** - Hot/cold clusters, spatial patterns
4. **Temporal** - Seasonal trends, velocity analysis
5. **Anomaly Detection** - Statistical outliers, fraud patterns
6. **Composite Metrics** - System health index, exclusion risk
7. **Advanced Insights** - Climate impact, data quality issues

### ML-Powered Trend Analysis (9 Endpoints)

✨ **NEW**: Machine Learning based trend analysis system

- **Dashboard Summary** - Overall system statistics and completion rates
- **7-Day Forecast** - Predictive biometric workload using Linear Regression
- **Enrollment Trends** - Age-wise daily enrollment patterns
- **State Performance** - Comparative state-level analysis
- **Bottleneck Detection** - Districts with completion issues
- **Daily Volume Analysis** - Capacity planning insights
- **Hotspot Identification** - High-volume pincode tracking
- **Fraud Detection** - Anomaly detection using Isolation Forest ML
- **Performance Ranking** - Prioritized problem area identification

## 📊 Use Cases for Officials

### 1. Resource Allocation
- Identify bottleneck districts needing additional staff
- Track high-volume pincodes requiring more centers
- Optimize resource deployment based on real-time data

### 2. Fraud Prevention
- ML-powered anomaly detection flags suspicious patterns
- Unusual enrollment spikes tracked by district
- Fraud scores help prioritize investigations

### 3. Capacity Planning
- 7-day predictive forecasting for biometric workload
- Daily volume analysis for staffing decisions
- Peak period identification

### 4. Performance Monitoring
- State-wise completion rate comparison
- District performance ranking
- Real-time progress tracking

### 5. Strategic Planning
- Enrollment trends by age groups
- Geographic coverage analysis
- System health metrics

## 🔧 Technologies

### Backend
- **FastAPI** - Modern Python web framework
- **DuckDB** - High-performance analytical database
- **Scikit-learn** - Machine Learning (Isolation Forest, Linear Regression)
- **Pandas** - Data manipulation
- **NumPy** - Numerical computing

### Data
- 12 CSV files included (enrollment, demographic, biometric)
- Multiple states and districts covered
- Time-series data from December 2025

## 📖 API Documentation

Full interactive API documentation available at:
- **Swagger UI**: http://127.0.0.1:8000/docs
- **ReDoc**: http://127.0.0.1:8000/redoc

### Example API Calls

```bash
# Get system summary
curl http://127.0.0.1:8000/api/trends/summary

# Get 7-day forecast
curl http://127.0.0.1:8000/api/trends/forecast

# Find bottleneck districts
curl http://127.0.0.1:8000/api/trends/bottleneck-districts

# Detect fraud patterns
curl http://127.0.0.1:8000/api/trends/fraud/anomalies

# State performance comparison
curl http://127.0.0.1:8000/api/trends/state-performance
```

## 📦 What's Included in Backend

✅ Complete FastAPI application
✅ 41 working endpoints (32 core + 9 ML-based)
✅ All data files (12 CSV files)
✅ ML models (Isolation Forest, Linear Regression)
✅ Comprehensive documentation
✅ Quick start script
✅ Requirements file with all dependencies
✅ Ready for deployment

## 🚀 Deployment

The backend is production-ready and can be deployed to:
- AWS (EC2, Lambda, ECS)
- Google Cloud Platform
- Azure
- Heroku
- Docker containers
- Any server with Python 3.12+

See `backend/SETUP_GUIDE.md` for deployment instructions.

## 📈 Performance

- Handles large datasets efficiently
- In-memory caching for ML models
- Fast analytical queries with DuckDB
- Lazy loading on first request
- Optimized for real-time dashboards

## 🔐 Security

For production deployment:
- Configure CORS properly
- Add authentication (API keys/OAuth)
- Use HTTPS
- Implement rate limiting
- Encrypt sensitive data

## 📄 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

- Check `/docs` endpoint for API reference
- Review `backend/SETUP_GUIDE.md` for setup help
- Examine `backend/README.md` for detailed documentation

## ✅ Verification

To verify everything is set up correctly:

```bash
cd backend
python -c "from routes.trend_analyser import router; print('✅ All modules loaded')"
python run.py
```

Then visit http://127.0.0.1:8000/docs to see all 41 endpoints.

## 🎉 Ready to Use

Your complete backend is ready with:
- ✅ 41 powerful analytics endpoints
- ✅ ML-powered fraud detection
- ✅ Predictive forecasting
- ✅ All data files included
- ✅ Complete documentation
- ✅ Production-ready code

Just run `cd backend && python run.py` to start!
