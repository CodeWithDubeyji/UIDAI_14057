const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

export async function fetchAPI<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
}

// Metric types
export interface MetricData<T> {
    metric: string;
    description?: string;
    data: T[];
}

// API endpoints
export const api = {
    // Data Insights
    enrollmentDeficit: () => fetchAPI<MetricData<any>>("/metrics/enrollment-deficit-ratio"),
    ageCohortImbalance: () => fetchAPI<MetricData<any>>("/metrics/age-cohort-imbalance"),
    ruralUrbanDisparity: () => fetchAPI<MetricData<any>>("/metrics/rural-urban-disparity"),
    pincodeGini: () => fetchAPI<any>("/metrics/pincode-gini"),
    demographicDeserts: () => fetchAPI<MetricData<any>>("/metrics/demographic-deserts"),

    // Update Health
    biometricFreshness: () => fetchAPI<MetricData<any>>("/metrics/biometric-freshness"),
    demographicStaleness: () => fetchAPI<MetricData<any>>("/metrics/demographic-staleness"),
    updateDependency: () => fetchAPI<MetricData<any>>("/metrics/update-dependency-ratio"),
    childTransition: () => fetchAPI<MetricData<any>>("/metrics/child-adult-transition"),
    multiUpdatePenalty: () => fetchAPI<MetricData<any>>("/metrics/multi-update-penalty"),

    // Geospatial
    coldClusters: () => fetchAPI<any>("/metrics/enrollment-cold-clusters"),
    hotClusters: () => fetchAPI<any>("/metrics/update-hot-clusters"),
    moranI: () => fetchAPI<any>("/metrics/moran-i"),
    contiguityRatio: () => fetchAPI<any>("/metrics/contiguity-ratio"),
    densityVariance: () => fetchAPI<MetricData<any>>("/metrics/enrollment-density-variance"),

    // Temporal
    monsoonSpike: () => fetchAPI<MetricData<any>>("/metrics/monsoon-fingerprint-spike"),
    enrollmentVelocity: () => fetchAPI<MetricData<any>>("/metrics/enrollment-velocity"),
    seasonalityIndex: () => fetchAPI<MetricData<any>>("/metrics/update-seasonality-index"),
    weekendEffect: () => fetchAPI<MetricData<any>>("/metrics/weekend-effect"),
    cohortAging: () => fetchAPI<MetricData<any>>("/metrics/cohort-aging-progress"),

    // Anomaly
    enrollmentZscore: () => fetchAPI<MetricData<any>>("/metrics/enrollment-zscore"),
    bulkDays: () => fetchAPI<any>("/metrics/bulk-enrollment-days"),
    orphanUpdates: () => fetchAPI<any>("/metrics/orphan-updates"),
    ageSkew: () => fetchAPI<MetricData<any>>("/metrics/age-distribution-skew"),
    populationMismatch: () => fetchAPI<MetricData<any>>("/metrics/population-mismatch"),

    // Composite
    healthIndex: () => fetchAPI<MetricData<any>>("/metrics/aadhaar-health-index"),
    exclusionRisk: () => fetchAPI<MetricData<any>>("/metrics/exclusion-risk-index"),

    // Crazy Insights
    monsoonIndex: () => fetchAPI<MetricData<any>>("/metrics/monsoon-fingerprint-index"),
    enrollmentMirage: () => fetchAPI<MetricData<any>>("/metrics/enrollment-mirage"),
    phantomChildren: () => fetchAPI<MetricData<any>>("/metrics/phantom-children"),
    districtTwins: () => fetchAPI<any>("/metrics/district-twins"),
    ghostTowns: () => fetchAPI<any>("/metrics/pincode-ghost-towns"),

    // General
    allMetrics: () => fetchAPI<any>("/metrics"),
    enrollmentsByState: () => fetchAPI<any>("/enrollments_by_state"),

    // Trend Analysis (ML-based)
    trendSummary: () => fetchAPI<any>("/api/trends/summary"),
    trendForecast: () => fetchAPI<any>("/api/trends/forecast"),
    enrollmentByAge: () => fetchAPI<any>("/api/trends/enrollment-by-age"),
    statePerformance: () => fetchAPI<any>("/api/trends/state-performance"),
    bottleneckDistricts: () => fetchAPI<any>("/api/trends/bottleneck-districts"),
    dailyVolume: () => fetchAPI<any>("/api/trends/daily-volume"),
    highVolumePincodes: () => fetchAPI<any>("/api/trends/high-volume-pincodes"),
    fraudAnomalies: () => fetchAPI<any>("/api/trends/fraud/anomalies"),
};
