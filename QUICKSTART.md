# Aadhaar Insight Atlas - Complete System

Full-stack analytics platform with 41 endpoints (32 core metrics + 9 ML-powered trend analysis).

## 🚀 Quick Start

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python run.py
```

Backend will run on: **http://127.0.0.1:8001**

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on: **http://localhost:3000**

## 📊 New Trend Analysis Features

Access the **Trends** page from the navigation menu to explore:

### 1. **Dashboard Summary**
- Total enrollments across all states
- Demographic & biometric completion rates
- ML-detected fraud cases
- Coverage statistics

### 2. **Age Distribution Analysis**
- Interactive pie chart showing enrollment breakdown
- Children 0-5, 5-17, and Adults 18+
- Visual representation of age cohorts

### 3. **7-Day Predictive Forecast**
- Machine Learning based predictions (Linear Regression)
- Biometric workload forecasting
- Helps with resource planning

### 4. **Daily Volume Trends**
- 30-day historical analysis
- Enrollment, demographic, and biometric activity
- Identify peak periods for capacity planning

### 5. **State Performance Comparison**
- Top 10 states by enrollment volume
- Completion rate comparison
- Visual progress bars for easy assessment

### 6. **Bottleneck Districts**
- Districts with <80% completion rates
- Identifies demographic vs biometric backlogs
- Prioritized by enrollment volume

### 7. **High Volume Pincodes**
- Top 10 pincodes requiring attention
- Horizontal bar chart visualization
- Resource deployment planning

### 8. **Fraud Detection Alerts**
- ML-powered anomaly detection (Isolation Forest)
- Suspicious enrollment pattern identification
- Anomaly scores and timestamps
- Last detection dates

## 🎨 Design Features

✅ **Glassmorphic UI** - Modern dark theme with glass cards
✅ **Responsive Layout** - Works on all screen sizes
✅ **Smooth Animations** - Framer Motion transitions
✅ **Interactive Charts** - Recharts library for visualizations
✅ **Real-time Updates** - React Query for data fetching

## 🔧 Technology Stack

### Backend
- FastAPI
- DuckDB
- Pandas
- Scikit-learn (ML)
- Python 3.12+

### Frontend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Recharts
- React Query

## 📍 Navigation

The app includes these main sections:

1. **Dashboard** - National overview with health metrics
2. **Trends** ⭐ NEW - ML-powered trend analysis
3. **Indices** - Detailed metric exploration
4. **Clusters** - Geospatial analysis
5. **Anomalies** - Outlier detection
6. **Compare** - Cross-state comparison
7. **About** - System information

## 🎯 Key Metrics

### Trend Analysis Endpoints
- `/api/trends/summary` - Overall statistics
- `/api/trends/forecast` - 7-day predictions
- `/api/trends/enrollment-by-age` - Age distribution
- `/api/trends/state-performance` - State comparison
- `/api/trends/bottleneck-districts` - Problem areas
- `/api/trends/daily-volume` - Time series data
- `/api/trends/high-volume-pincodes` - Hotspots
- `/api/trends/fraud/anomalies` - Fraud detection

## 🛠️ Development

### Backend
```bash
cd backend
uvicorn main:app --reload --port 8001
```

### Frontend
```bash
cd frontend
npm run dev
```

## 📦 Deployment

### Backend
- Deploy to AWS, GCP, Azure, or Heroku
- Update CORS settings for production
- Set environment variables
- Use Gunicorn for production

### Frontend
- Deploy to Vercel (recommended)
- Set `NEXT_PUBLIC_API_URL` environment variable
- Run `npm run build` for production

## 🔐 Security

For production:
1. Configure CORS for specific domains
2. Add API authentication
3. Implement rate limiting
4. Use HTTPS
5. Encrypt sensitive data

## 📈 Performance

- Data loaded on first request and cached
- ML models trained once and reused
- Optimized queries with DuckDB
- Lazy loading components
- React Query for efficient data fetching

## ✅ Verification

1. Start backend: `cd backend && python run.py`
2. Visit: http://127.0.0.1:8001/docs (should see 41 endpoints)
3. Start frontend: `cd frontend && npm run dev`
4. Visit: http://localhost:3000 (should see landing page)
5. Click "Enter Dashboard" → Navigate to "Trends"
6. All charts and metrics should load

## 🎉 You're Ready!

Your complete Aadhaar analytics system is now running with:
- ✅ 32 core metrics
- ✅ 9 ML-powered trend analysis features
- ✅ Beautiful glassmorphic UI
- ✅ Interactive visualizations
- ✅ Real-time data updates

Enjoy exploring the data!
