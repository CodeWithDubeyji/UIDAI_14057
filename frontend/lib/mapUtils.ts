/**
 * Map utility functions for India choropleth visualization
 */

// Color scale for enrollment intensity (green → yellow → red)
export const getEnrollmentColor = (value: number, max: number): string => {
    if (max === 0) return '#6b7280'; // gray for no data
    const ratio = value / max;

    if (ratio < 0.25) return '#22c55e';      // green - low
    if (ratio < 0.5) return '#84cc16';       // lime
    if (ratio < 0.75) return '#eab308';      // yellow - medium
    if (ratio < 0.9) return '#f97316';       // orange
    return '#ef4444';                         // red - high
};

// Color scale for health index (red → yellow → green, reversed)
export const getHealthColor = (value: number): string => {
    if (value >= 70) return '#22c55e';       // green - good
    if (value >= 50) return '#84cc16';       // lime
    if (value >= 30) return '#eab308';       // yellow - medium
    if (value >= 15) return '#f97316';       // orange
    return '#ef4444';                         // red - bad
};

// Color scale for risk (green → red, higher = worse)
export const getRiskColor = (value: number): string => {
    if (value <= 20) return '#22c55e';       // green - low risk
    if (value <= 40) return '#84cc16';       // lime
    if (value <= 60) return '#eab308';       // yellow
    if (value <= 80) return '#f97316';       // orange
    return '#ef4444';                         // red - high risk
};

// Cluster colors for DBSCAN/KMeans visualization
export const CLUSTER_COLORS = [
    '#00d4aa', // teal
    '#00b8d4', // cyan
    '#8b5cf6', // purple
    '#f59e0b', // amber
    '#ef4444', // red
    '#22c55e', // green
    '#ec4899', // pink
    '#6366f1', // indigo
];

export const getClusterColor = (clusterId: number): string => {
    if (clusterId < 0) return '#6b7280'; // gray for noise
    return CLUSTER_COLORS[clusterId % CLUSTER_COLORS.length];
};

// India bounds for map initialization
export const INDIA_BOUNDS = {
    center: [20.5937, 78.9629] as [number, number],
    zoom: 4.5,
    minZoom: 4,
    maxZoom: 18,
    bounds: [[6.5, 68.0], [35.5, 97.5]] as [[number, number], [number, number]],
};

// State code to name mapping for GeoJSON matching
export const STATE_NAME_MAP: Record<string, string> = {
    'andhra pradesh': 'Andhra Pradesh',
    'arunachal pradesh': 'Arunachal Pradesh',
    'assam': 'Assam',
    'bihar': 'Bihar',
    'chhattisgarh': 'Chhattisgarh',
    'goa': 'Goa',
    'gujarat': 'Gujarat',
    'haryana': 'Haryana',
    'himachal pradesh': 'Himachal Pradesh',
    'jharkhand': 'Jharkhand',
    'karnataka': 'Karnataka',
    'kerala': 'Kerala',
    'madhya pradesh': 'Madhya Pradesh',
    'maharashtra': 'Maharashtra',
    'manipur': 'Manipur',
    'meghalaya': 'Meghalaya',
    'mizoram': 'Mizoram',
    'nagaland': 'Nagaland',
    'odisha': 'Odisha',
    'orissa': 'Odisha', // Alias - old name
    'punjab': 'Punjab',
    'rajasthan': 'Rajasthan',
    'sikkim': 'Sikkim',
    'tamil nadu': 'Tamil Nadu',
    'telangana': 'Telangana',
    'tripura': 'Tripura',
    'uttar pradesh': 'Uttar Pradesh',
    'uttarakhand': 'Uttarakhand',
    'west bengal': 'West Bengal',
    'delhi': 'Delhi',
    'jammu and kashmir': 'Jammu and Kashmir',
    'ladakh': 'Ladakh',
    'puducherry': 'Puducherry',
    'chandigarh': 'Chandigarh',
    'andaman and nicobar islands': 'Andaman and Nicobar Islands',
    'dadra and nagar haveli and daman and diu': 'Dadra and Nagar Haveli and Daman and Diu',
    'lakshadweep': 'Lakshadweep',
};

// Format large numbers for display
export const formatNumber = (num: number): string => {
    if (num >= 10000000) return (num / 10000000).toFixed(1) + ' Cr';
    if (num >= 100000) return (num / 100000).toFixed(1) + ' L';
    if (num >= 1000) return (num / 1000).toFixed(1) + ' K';
    return num.toString();
};

// GeoJSON URL for India states (public CDN)
export const INDIA_STATES_GEOJSON_URL =
    'https://raw.githubusercontent.com/geohacker/india/master/state/india_telengana.geojson';
