"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    Users, Activity, TrendingUp, AlertTriangle, MapPin,
    Calendar, Clock, BarChart3, Target, Shield
} from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { GlassCard, SectionTitle } from "@/components/GlassCard";
import { api } from "@/lib/api";
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, 
    ResponsiveContainer, Legend, PieChart, Pie, Cell
} from "recharts";

const COLORS = ['#00d4aa', '#00b8d4', '#6366f1', '#f59e0b', '#ef4444'];

export default function TrendsPage() {
    const { data: summary, isLoading: loadingSummary } = useQuery({
        queryKey: ["trendSummary"],
        queryFn: api.trendSummary,
    });

    const { data: forecast } = useQuery({
        queryKey: ["trendForecast"],
        queryFn: api.trendForecast,
    });

    const { data: enrollmentByAge } = useQuery({
        queryKey: ["enrollmentByAge"],
        queryFn: api.enrollmentByAge,
    });

    const { data: statePerformance } = useQuery({
        queryKey: ["statePerformance"],
        queryFn: api.statePerformance,
    });

    const { data: bottlenecks } = useQuery({
        queryKey: ["bottleneckDistricts"],
        queryFn: api.bottleneckDistricts,
    });

    const { data: dailyVolume } = useQuery({
        queryKey: ["dailyVolume"],
        queryFn: api.dailyVolume,
    });

    const { data: highVolumePincodes } = useQuery({
        queryKey: ["highVolumePincodes"],
        queryFn: api.highVolumePincodes,
    });

    const { data: fraudAnomalies } = useQuery({
        queryKey: ["fraudAnomalies"],
        queryFn: api.fraudAnomalies,
    });

    // Prepare chart data
    const ageDistributionData = enrollmentByAge ? [
        { name: 'Age 0-5', value: enrollmentByAge.age_0_5?.reduce((a: number, b: number) => a + b, 0) || 0 },
        { name: 'Age 5-17', value: enrollmentByAge.age_5_17?.reduce((a: number, b: number) => a + b, 0) || 0 },
        { name: 'Age 18+', value: enrollmentByAge.age_18_plus?.reduce((a: number, b: number) => a + b, 0) || 0 },
    ] : [];

    // Daily volume chart data (last 30 days)
    const volumeChartData = dailyVolume && dailyVolume.dates ? (() => {
        const len = dailyVolume.dates.length;
        const startIndex = Math.max(0, len - 30);
        return dailyVolume.dates.slice(startIndex).map((date: string, i: number) => ({
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            enrollments: dailyVolume.enrollments[startIndex + i],
            demographics: dailyVolume.demographics[startIndex + i],
            biometrics: dailyVolume.biometrics[startIndex + i],
        }));
    })() : [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <TrendingUp className="w-7 h-7 text-primary" />
                        ML-Powered Trend Analysis
                    </h1>
                    <p className="text-muted-foreground">Predictive analytics and fraud detection for Aadhaar enrollment data</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {summary?.date_range && (
                        <span>{summary.date_range.start} to {summary.date_range.end}</span>
                    )}
                </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Total Enrollments"
                    value={summary?.total_enrollment?.toLocaleString() || "—"}
                    subtitle={`${summary?.states_covered || 0} states covered`}
                    description="Total enrollment records across all age groups"
                    icon={Users}
                    color="teal"
                />
                <KPICard
                    title="Demographic Completion"
                    value={`${summary?.demographic_completion_rate || 0}%`}
                    subtitle="Overall completion rate"
                    description="Percentage of enrollments with completed demographic updates"
                    icon={Activity}
                    color="blue"
                />
                <KPICard
                    title="Biometric Completion"
                    value={`${summary?.biometric_completion_rate || 0}%`}
                    subtitle="Overall completion rate"
                    description="Percentage of enrollments with completed biometric captures"
                    icon={Target}
                    color="amber"
                />
                <KPICard
                    title="Fraud Alerts"
                    value={summary?.fraud_cases?.toLocaleString() || "0"}
                    subtitle="ML-detected anomalies"
                    description="Districts flagged by Isolation Forest algorithm"
                    icon={Shield}
                    color="red"
                />
            </div>

            {/* Age Distribution & 7-Day Forecast */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Age Distribution Pie Chart */}
                <GlassCard>
                    <SectionTitle subtitle="Enrollment breakdown by age cohorts">
                        Age Group Distribution
                    </SectionTitle>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={ageDistributionData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {ageDistributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(20, 30, 50, 0.95)', 
                                        border: '1px solid rgba(136, 146, 166, 0.2)',
                                        borderRadius: '8px'
                                    }} 
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[0] }} />
                            <span className="text-muted-foreground">Children 0-5</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[1] }} />
                            <span className="text-muted-foreground">Children 5-17</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[2] }} />
                            <span className="text-muted-foreground">Adults 18+</span>
                        </div>
                    </div>
                </GlassCard>

                {/* 7-Day Forecast */}
                <GlassCard>
                    <SectionTitle subtitle="ML prediction using Linear Regression">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            7-Day Biometric Load Forecast
                        </div>
                    </SectionTitle>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={forecast || []}>
                                <XAxis 
                                    dataKey="date" 
                                    stroke="#8892a6"
                                    tick={{ fill: '#8892a6', fontSize: 12 }}
                                    tickFormatter={(value: any) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                />
                                <YAxis 
                                    stroke="#8892a6"
                                    tick={{ fill: '#8892a6', fontSize: 12 }}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(20, 30, 50, 0.95)', 
                                        border: '1px solid rgba(136, 146, 166, 0.2)',
                                        borderRadius: '8px'
                                    }}
                                    labelFormatter={(value: any) => new Date(value).toLocaleDateString()}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="predicted_biometric_load" 
                                    stroke="#00d4aa" 
                                    strokeWidth={3}
                                    dot={{ fill: '#00d4aa', r: 5 }}
                                    name="Predicted Load"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        * Predictions based on historical biometric update patterns
                    </p>
                </GlassCard>
            </div>

            {/* Daily Volume Trend */}
            <GlassCard>
                <SectionTitle subtitle="30-day enrollment, demographic, and biometric activity">
                    Daily Volume Trends
                </SectionTitle>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={volumeChartData}>
                            <XAxis 
                                dataKey="date" 
                                stroke="#8892a6"
                                tick={{ fill: '#8892a6', fontSize: 12 }}
                            />
                            <YAxis 
                                stroke="#8892a6"
                                tick={{ fill: '#8892a6', fontSize: 12 }}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'rgba(20, 30, 50, 0.95)', 
                                    border: '1px solid rgba(136, 146, 166, 0.2)',
                                    borderRadius: '8px'
                                }} 
                            />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="enrollments" 
                                stroke={COLORS[0]} 
                                strokeWidth={2}
                                name="Enrollments"
                            />
                            <Line 
                                type="monotone" 
                                dataKey="demographics" 
                                stroke={COLORS[1]} 
                                strokeWidth={2}
                                name="Demographics"
                            />
                            <Line 
                                type="monotone" 
                                dataKey="biometrics" 
                                stroke={COLORS[2]} 
                                strokeWidth={2}
                                name="Biometrics"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>

            {/* State Performance & Bottleneck Districts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* State Performance */}
                <GlassCard>
                    <SectionTitle subtitle="Top 10 states by enrollment volume">
                        State Performance Comparison
                    </SectionTitle>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {statePerformance?.slice(0, 10).map((state: any, i: number) => (
                            <motion.div
                                key={state.state}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        <span className="font-semibold">{state.state}</span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        {state.total_enrolled?.toLocaleString()} enrolled
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-3">
                                    <div>
                                        <div className="text-xs text-muted-foreground mb-1">Demographic Rate</div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-blue-500 rounded-full transition-all"
                                                    style={{ width: `${state.demographic_rate}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium">{state.demographic_rate}%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground mb-1">Biometric Rate</div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-teal-500 rounded-full transition-all"
                                                    style={{ width: `${state.biometric_rate}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium">{state.biometric_rate}%</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>

                {/* Bottleneck Districts */}
                <GlassCard>
                    <SectionTitle subtitle="Districts with <80% completion rates">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                            Bottleneck Districts
                        </div>
                    </SectionTitle>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {bottlenecks?.slice(0, 10).map((district: any, i: number) => (
                            <motion.div
                                key={`${district.state}-${district.district}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <div className="font-semibold">{district.district}</div>
                                        <div className="text-xs text-muted-foreground">{district.state}</div>
                                    </div>
                                    <div className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
                                        {district.issue}
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                                    <div>
                                        <div className="text-xs text-muted-foreground">Enrolled</div>
                                        <div className="font-medium">{district.total_enrolled?.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground">Demo Rate</div>
                                        <div className="font-medium">{district.demographic_rate}%</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground">Bio Rate</div>
                                        <div className="font-medium">{district.biometric_rate}%</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </GlassCard>
            </div>

            {/* High Volume Pincodes & Fraud Anomalies */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* High Volume Pincodes */}
                <GlassCard>
                    <SectionTitle subtitle="Top 10 pincodes requiring resource attention">
                        <div className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary" />
                            High Volume Pincodes
                        </div>
                    </SectionTitle>
                    <div className="h-80 overflow-y-auto">
                        <ResponsiveContainer width="100%" height={highVolumePincodes?.slice(0, 10).length * 50 || 400}>
                            <BarChart 
                                data={highVolumePincodes?.slice(0, 10) || []} 
                                layout="vertical"
                                margin={{ left: 60 }}
                            >
                                <XAxis type="number" stroke="#8892a6" tick={{ fill: '#8892a6', fontSize: 12 }} />
                                <YAxis 
                                    type="category" 
                                    dataKey="pincode" 
                                    stroke="#8892a6"
                                    tick={{ fill: '#8892a6', fontSize: 12 }}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(20, 30, 50, 0.95)', 
                                        border: '1px solid rgba(136, 146, 166, 0.2)',
                                        borderRadius: '8px'
                                    }}
                                    formatter={(value: any, name: any) => {
                                        if (name === "total_enrollments") return [value.toLocaleString(), "Enrollments"];
                                        return [value, name];
                                    }}
                                />
                                <Bar dataKey="total_enrollments" fill="#00d4aa" radius={[0, 8, 8, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                {/* Fraud Anomalies */}
                <GlassCard>
                    <SectionTitle subtitle="ML-detected suspicious enrollment patterns">
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-red-500" />
                            Fraud Detection Alerts
                        </div>
                    </SectionTitle>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {fraudAnomalies?.slice(0, 10).map((anomaly: any, i: number) => (
                            <motion.div
                                key={`${anomaly.state}-${anomaly.district}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-colors"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <div className="font-semibold flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 text-red-500" />
                                            {anomaly.district}
                                        </div>
                                        <div className="text-xs text-muted-foreground">{anomaly.state}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-red-500">{anomaly.anomaly_score}</div>
                                        <div className="text-xs text-muted-foreground">Anomaly Score</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                                    <div>
                                        <div className="text-xs text-muted-foreground">Adult Enrollments</div>
                                        <div className="font-medium">{anomaly.adult_enrollments?.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground">Last Detected</div>
                                        <div className="font-medium">{anomaly.last_detected}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <div className="mt-4 p-3 rounded-lg bg-secondary/30 text-xs">
                        <p className="text-muted-foreground">
                            <strong className="text-foreground">Algorithm:</strong> Isolation Forest (contamination=1%)
                            detects unusual spikes in adult enrollment patterns relative to 7-day rolling averages.
                        </p>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
