"""
Trend Analyser Routes - ML-based predictive analytics for Aadhaar enrollment trends
Provides insights on enrollment patterns, completion rates, bottlenecks, and fraud detection
"""

from fastapi import APIRouter
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.linear_model import LinearRegression
import glob
import os

router = APIRouter(prefix="/api/trends", tags=["Trend Analysis"])

# Global State for ML models and processed data
trend_state = {
    "data": None,
    "models": {},
    "insights": {},
    "data_loaded": False
}

DATA_DIR = "data/"  # Data folder within backend directory


def load_dataset_group(file_pattern):
    """
    Reads all files matching a pattern (e.g., 'enrollment_*.csv') 
    and combines them into a single DataFrame.
    """
    search_path = os.path.join(DATA_DIR, file_pattern)
    files = glob.glob(search_path)
    
    if not files:
        print(f"⚠️ [WARNING] No files found for pattern: {file_pattern}")
        return pd.DataFrame()

    print(f"📂 [SYSTEM] Found {len(files)} files for '{file_pattern}'. Merging...")
    
    df_list = []
    for file in files:
        try:
            df = pd.read_csv(file)
            df_list.append(df)
        except Exception as e:
            print(f"❌ [ERROR] Could not read {file}: {e}")

    if df_list:
        combined_df = pd.concat(df_list, ignore_index=True)
        return combined_df
    else:
        return pd.DataFrame()


def load_and_merge_data():
    """Load and merge enrollment, demographic, and biometric data"""
    print("⏳ [SYSTEM] Starting Trend Analysis Data Pipeline...")
    
    df_enr = load_dataset_group("enrollment_*.csv")
    df_demo = load_dataset_group("demographic_*.csv")
    df_bio = load_dataset_group("biomterics_*.csv")
    
    if df_enr.empty or df_demo.empty or df_bio.empty:
        print("❌ [CRITICAL] One or more dataset groups are missing!")
        return pd.DataFrame()

    print("🔗 [SYSTEM] Linking Datasets on Date + Location...")
    
    merge_keys = ['date', 'state', 'district', 'pincode']
    df_master = pd.merge(df_enr, df_demo, on=merge_keys, how='left')
    df_master = pd.merge(df_master, df_bio, on=merge_keys, how='left')
    df_master = df_master.fillna(0)
    
    print(f"✅ [SYSTEM] Data Pipeline Complete. Total Records: {len(df_master)}")
    return df_master


def train_analytics_engine(df):
    """Train ML models for fraud detection and forecasting"""
    if df.empty:
        return
    
    print("🧠 [ML] Training Models on Combined Data...")
    
    # Feature Engineering
    df['rolling_adult_enr'] = df.groupby('district')['age_18_greater'].transform(
        lambda x: x.rolling(7).mean().fillna(0)
    )
    df['fraud_spike_score'] = df['age_18_greater'] / (df['rolling_adult_enr'] + 1)
    df['bio_failure_ratio'] = df['bio_age_17_'] / (df['age_18_greater'].cumsum() + 10)

    # Fraud Detection (Isolation Forest)
    iso = IsolationForest(contamination=0.01, random_state=42)
    df['is_anomaly'] = iso.fit_predict(df[['age_18_greater', 'fraud_spike_score', 'bio_age_17_']])
    
    # Forecasting (Linear Regression)
    df['date'] = pd.to_datetime(df['date'], format='%d-%m-%Y')
    df['date_ordinal'] = df['date'].map(pd.Timestamp.toordinal)
    trend_model = LinearRegression()
    
    recent_data = df.tail(min(len(df), 2000))
    trend_model.fit(recent_data[['date_ordinal']], recent_data['bio_age_17_'])
    
    # Save State
    trend_state['data'] = df
    trend_state['models']['fraud'] = iso
    trend_state['models']['trend'] = trend_model
    trend_state['insights'] = {
        "total_records": len(df),
        "fraud_alerts": int(len(df[df['is_anomaly'] == -1])),
        "trend_slope": float(trend_model.coef_[0])
    }
    trend_state['data_loaded'] = True
    print("✅ [ML] Training Finished.")


def ensure_data_loaded():
    """Ensure data is loaded before processing requests"""
    if not trend_state['data_loaded']:
        df = load_and_merge_data()
        if not df.empty:
            train_analytics_engine(df)


@router.get("/summary")
def get_summary():
    """Returns aggregated stats for the dashboard"""
    ensure_data_loaded()
    
    if trend_state['data'] is None:
        return {"error": "Data not loaded"}
    
    df = trend_state['data']
    
    total_enrollments = int(df['age_0_5'].sum() + df['age_5_17'].sum() + df['age_18_greater'].sum())
    total_demographics = int(df['demo_age_5_17'].sum() + df['demo_age_17_'].sum())
    total_biometrics = int(df['bio_age_5_17'].sum() + df['bio_age_17_'].sum())
    
    demo_completion_rate = (total_demographics / total_enrollments * 100) if total_enrollments > 0 else 0
    bio_completion_rate = (total_biometrics / total_enrollments * 100) if total_enrollments > 0 else 0
    
    return {
        "total_enrollment": total_enrollments,
        "demographic_completion_rate": round(demo_completion_rate, 2),
        "biometric_completion_rate": round(bio_completion_rate, 2),
        "fraud_cases": trend_state['insights']['fraud_alerts'],
        "districts_covered": int(df['district'].nunique()),
        "states_covered": int(df['state'].nunique()),
        "date_range": {
            "start": str(df['date'].min().date()),
            "end": str(df['date'].max().date())
        }
    }


@router.get("/forecast")
def get_forecast():
    """Returns ML prediction for next 7 days"""
    ensure_data_loaded()
    
    if 'trend' not in trend_state['models']:
        return {"error": "Model not trained"}
    
    model = trend_state['models']['trend']
    last_date = trend_state['data']['date'].max()
    
    future_dates = [last_date + pd.Timedelta(days=x) for x in range(1, 8)]
    future_ordinals = np.array([d.toordinal() for d in future_dates]).reshape(-1, 1)
    predictions = model.predict(future_ordinals)
    
    return [
        {"date": str(d.date()), "predicted_biometric_load": int(max(0, p))} 
        for d, p in zip(future_dates, predictions)
    ]


@router.get("/enrollment-by-age")
def enrollment_by_age():
    """Age-wise enrollment trends over time"""
    ensure_data_loaded()
    
    if trend_state['data'] is None:
        return []
    
    df = trend_state['data']
    
    daily = df.groupby('date').agg({
        'age_0_5': 'sum',
        'age_5_17': 'sum',
        'age_18_greater': 'sum'
    }).reset_index()
    
    return {
        "dates": [str(d.date()) for d in daily['date']],
        "age_0_5": daily['age_0_5'].tolist(),
        "age_5_17": daily['age_5_17'].tolist(),
        "age_18_plus": daily['age_18_greater'].tolist()
    }


@router.get("/state-performance")
def state_performance():
    """State-wise enrollment and completion rates"""
    ensure_data_loaded()
    
    if trend_state['data'] is None:
        return []
    
    df = trend_state['data']
    
    state_stats = df.groupby('state').agg({
        'age_0_5': 'sum',
        'age_5_17': 'sum',
        'age_18_greater': 'sum',
        'demo_age_5_17': 'sum',
        'demo_age_17_': 'sum',
        'bio_age_5_17': 'sum',
        'bio_age_17_': 'sum'
    }).reset_index()
    
    state_stats['total_enrolled'] = state_stats['age_0_5'] + state_stats['age_5_17'] + state_stats['age_18_greater']
    state_stats['demo_completed'] = state_stats['demo_age_5_17'] + state_stats['demo_age_17_']
    state_stats['bio_completed'] = state_stats['bio_age_5_17'] + state_stats['bio_age_17_']
    state_stats['demo_rate'] = (state_stats['demo_completed'] / state_stats['total_enrolled'] * 100).fillna(0)
    state_stats['bio_rate'] = (state_stats['bio_completed'] / state_stats['total_enrolled'] * 100).fillna(0)
    
    state_stats = state_stats.sort_values('total_enrolled', ascending=False)
    
    return [
        {
            "state": row['state'],
            "total_enrolled": int(row['total_enrolled']),
            "demographic_rate": round(row['demo_rate'], 2),
            "biometric_rate": round(row['bio_rate'], 2),
            "pending_demographics": int(row['total_enrolled'] - row['demo_completed']),
            "pending_biometrics": int(row['total_enrolled'] - row['bio_completed'])
        }
        for _, row in state_stats.iterrows()
    ]


@router.get("/bottleneck-districts")
def bottleneck_districts():
    """Districts with low biometric/demographic completion"""
    ensure_data_loaded()
    
    if trend_state['data'] is None:
        return []
    
    df = trend_state['data']
    
    district_stats = df.groupby(['state', 'district']).agg({
        'age_0_5': 'sum',
        'age_5_17': 'sum',
        'age_18_greater': 'sum',
        'demo_age_5_17': 'sum',
        'demo_age_17_': 'sum',
        'bio_age_5_17': 'sum',
        'bio_age_17_': 'sum'
    }).reset_index()
    
    district_stats['total_enrolled'] = district_stats['age_0_5'] + district_stats['age_5_17'] + district_stats['age_18_greater']
    district_stats['demo_completed'] = district_stats['demo_age_5_17'] + district_stats['demo_age_17_']
    district_stats['bio_completed'] = district_stats['bio_age_5_17'] + district_stats['bio_age_17_']
    district_stats['demo_rate'] = (district_stats['demo_completed'] / district_stats['total_enrolled'] * 100).fillna(0)
    district_stats['bio_rate'] = (district_stats['bio_completed'] / district_stats['total_enrolled'] * 100).fillna(0)
    
    bottlenecks = district_stats[
        (district_stats['total_enrolled'] > 50) & 
        ((district_stats['bio_rate'] < 80) | (district_stats['demo_rate'] < 80))
    ].sort_values('total_enrolled', ascending=False).head(20)
    
    return [
        {
            "state": row['state'],
            "district": row['district'],
            "total_enrolled": int(row['total_enrolled']),
            "demographic_rate": round(row['demo_rate'], 2),
            "biometric_rate": round(row['bio_rate'], 2),
            "issue": "Biometric Backlog" if row['bio_rate'] < row['demo_rate'] else "Demographic Backlog"
        }
        for _, row in bottlenecks.iterrows()
    ]


@router.get("/daily-volume")
def daily_volume():
    """Daily enrollment, demographic, and biometric volumes"""
    ensure_data_loaded()
    
    if trend_state['data'] is None:
        return []
    
    df = trend_state['data']
    
    daily = df.groupby('date').agg({
        'age_0_5': 'sum',
        'age_5_17': 'sum',
        'age_18_greater': 'sum',
        'demo_age_5_17': 'sum',
        'demo_age_17_': 'sum',
        'bio_age_5_17': 'sum',
        'bio_age_17_': 'sum'
    }).reset_index()
    
    daily['enrollments'] = daily['age_0_5'] + daily['age_5_17'] + daily['age_18_greater']
    daily['demographics'] = daily['demo_age_5_17'] + daily['demo_age_17_']
    daily['biometrics'] = daily['bio_age_5_17'] + daily['bio_age_17_']
    
    return {
        "dates": [str(d.date()) for d in daily['date']],
        "enrollments": daily['enrollments'].tolist(),
        "demographics": daily['demographics'].tolist(),
        "biometrics": daily['biometrics'].tolist()
    }


@router.get("/high-volume-pincodes")
def high_volume_pincodes():
    """Top 30 pincodes by enrollment volume"""
    ensure_data_loaded()
    
    if trend_state['data'] is None:
        return []
    
    df = trend_state['data']
    
    pincode_stats = df.groupby(['state', 'district', 'pincode']).agg({
        'age_0_5': 'sum',
        'age_5_17': 'sum',
        'age_18_greater': 'sum'
    }).reset_index()
    
    pincode_stats['total'] = pincode_stats['age_0_5'] + pincode_stats['age_5_17'] + pincode_stats['age_18_greater']
    top_pincodes = pincode_stats.sort_values('total', ascending=False).head(30)
    
    return [
        {
            "pincode": row['pincode'],
            "district": row['district'],
            "state": row['state'],
            "total_enrollments": int(row['total']),
            "children_0_5": int(row['age_0_5']),
            "children_5_17": int(row['age_5_17']),
            "adults": int(row['age_18_greater'])
        }
        for _, row in top_pincodes.iterrows()
    ]


@router.get("/fraud/anomalies")
def fraud_anomalies():
    """Districts flagged for unusual enrollment patterns"""
    ensure_data_loaded()
    
    if trend_state['data'] is None:
        return []
    
    df = trend_state['data']
    
    anomalies = df[df['is_anomaly'] == -1].groupby(['state', 'district']).agg({
        'age_18_greater': 'sum',
        'fraud_spike_score': 'max',
        'date': 'max'
    }).reset_index().sort_values('fraud_spike_score', ascending=False).head(20)
    
    return [
        {
            "state": row['state'],
            "district": row['district'],
            "adult_enrollments": int(row['age_18_greater']),
            "anomaly_score": round(row['fraud_spike_score'], 2),
            "last_detected": str(row['date'].date())
        }
        for _, row in anomalies.iterrows()
    ]
