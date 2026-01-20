# Complete Backend Setup Guide

## 🎯 What's Included

This complete backend includes:
- ✅ 32 Core Analytics Endpoints (DuckDB-based)
- ✅ 9 ML-Powered Trend Analysis Endpoints
- ✅ All required data files (enrollment, demographic, biometric)
- ✅ Fraud detection using Isolation Forest ML
- ✅ 7-day predictive forecasting
- ✅ Ready for production deployment

## 📦 Installation

### Option 1: Using pip (Standard)

```bash
cd backend
pip install -r requirements.txt
```

### Option 2: Using uv (Faster)

```bash
cd backend
uv sync
```

## 🚀 Running the Server

### Method 1: Quick Start Script (Recommended)

```bash
cd backend
python run.py
```

### Method 2: Direct uvicorn

```bash
cd backend
python main.py
```

### Method 3: Manual uvicorn

```bash
cd backend
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

## 🌐 Access Points

After starting the server:

- **API Base**: http://127.0.0.1:8000
- **Interactive Docs**: http://127.0.0.1:8000/docs (Swagger UI)
- **Alternative Docs**: http://127.0.0.1:8000/redoc (ReDoc)
- **Metrics List**: http://127.0.0.1:8000/metrics

## 📊 Available Endpoints

### Quick Test Endpoints

```bash
# Health check
curl http://127.0.0.1:8000/

# List all endpoints
curl http://127.0.0.1:8000/metrics

# Trend analysis summary
curl http://127.0.0.1:8000/api/trends/summary

# 7-day forecast
curl http://127.0.0.1:8000/api/trends/forecast

# State performance
curl http://127.0.0.1:8000/api/trends/state-performance

# Bottleneck districts
curl http://127.0.0.1:8000/api/trends/bottleneck-districts

# Fraud detection
curl http://127.0.0.1:8000/api/trends/fraud/anomalies
```

## 📁 Project Structure

```
backend/
├── main.py                      # FastAPI entry point
├── run.py                       # Quick start script
├── requirements.txt             # Python dependencies
├── README.md                    # Documentation
├── SETUP_GUIDE.md              # This file
├── .gitignore                   # Git ignore rules
│
├── routes/                      # API route modules
│   ├── data_insights.py        # Metrics 1-5
│   ├── update_health.py        # Metrics 6-10
│   ├── geospatial.py           # Metrics 11-15
│   ├── temporal.py             # Metrics 16-20
│   ├── anomaly.py              # Metrics 21-25
│   ├── composite.py            # Metrics 26-27
│   ├── crazy_insights.py       # Metrics 28-32
│   └── trend_analyser.py       # ML Trend Analysis (NEW)
│
├── db/                          # Database utilities
│   └── duckdb_loader.py        # DuckDB data loader
│
└── data/                        # CSV datasets (INCLUDED)
    ├── enrollment_1 (1).csv    # Enrollment data
    ├── enrollment_1 (2).csv
    ├── enrollment_1 (3).csv
    ├── demographic_5 (1).csv   # Demographic updates
    ├── demographic_5 (2).csv
    ├── demographic_5 (3).csv
    ├── demographic_5 (4).csv
    ├── demographic_5 (5).csv
    ├── biomterics_1 (1).csv    # Biometric updates
    ├── biomterics_1 (2).csv
    ├── biomterics_1 (3).csv
    └── biomterics_1 (4).csv
```

## 🔧 Troubleshooting

### Issue: Port 8000 already in use

```bash
# Use a different port
uvicorn main:app --port 8001
```

### Issue: Module not found errors

```bash
# Ensure you're in the backend directory
cd backend

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Issue: Data files not loading

```bash
# Check if data directory exists
ls data/

# Verify CSV files are present
ls data/*.csv
```

### Issue: ML models not training

The trend analyser loads data on first request. If you see errors:

1. Check that all 12 CSV files are in `data/` folder
2. Verify date format in CSVs is `DD-MM-YYYY`
3. Ensure pandas and scikit-learn are installed

## 🎨 Frontend Integration

To connect a frontend (React, Next.js, etc.):

```javascript
// Example: Fetch trend summary
const response = await fetch('http://127.0.0.1:8000/api/trends/summary');
const data = await response.json();
console.log(data);
```

CORS is already configured to accept all origins in development.

## 📤 Deployment to Production

### For Cloud Deployment (AWS, GCP, Azure)

1. Update CORS settings in `main.py` for your domain
2. Set host to `0.0.0.0` for external access
3. Use environment variables for configuration
4. Consider using Gunicorn with Uvicorn workers:

```bash
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### For Docker Deployment

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🔐 Security Considerations

Before deploying to production:

1. **Remove/Restrict CORS**: Update `allow_origins` in main.py
2. **Add Authentication**: Implement API keys or OAuth
3. **Rate Limiting**: Add rate limiting middleware
4. **Data Encryption**: Ensure sensitive data is encrypted
5. **HTTPS**: Always use HTTPS in production

## 📈 Performance Tips

- Data loads once on first request and stays in memory
- ML models are trained once and cached
- For better performance with large datasets, consider:
  - Increasing Python memory limits
  - Using Redis for caching
  - Implementing database indexing

## 🤝 Contributing

To add new endpoints:

1. Create new route file in `routes/`
2. Import and register in `main.py`
3. Update README and this guide
4. Test with `/docs` endpoint

## 📞 Support

For issues or questions:
- Check the `/docs` endpoint for API schema
- Review logs for error details
- Ensure all dependencies are installed

## ✅ Verification Checklist

Before pushing to GitHub, verify:

- [ ] All 12 data CSV files are in `data/` folder
- [ ] `requirements.txt` includes all dependencies
- [ ] Server starts without errors
- [ ] All 41 endpoints are accessible
- [ ] `/docs` page loads correctly
- [ ] Trend analysis endpoints return data
- [ ] README.md is up to date

## 🎉 You're Ready!

Your complete backend is now set up and ready to use. Run `python run.py` to start serving 41 powerful analytics endpoints!
