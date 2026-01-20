"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    Users, Activity, Calendar, TrendingUp, MapPin,
    AlertCircle, CheckCircle, Clock
} from "lucide-react";
import { KPICard, METRIC_DESCRIPTIONS } from "@/components/KPICard";
import { GlassCard, SectionTitle } from "@/components/GlassCard";
import { api } from "@/lib/api";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

// Dynamic import for map component (Leaflet requires browser APIs)
const IndiaMap = dynamic(() => import("@/components/IndiaMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading map...</div>
        </div>
    ),
});

export default function NationalDashboard() {
    const { data: healthIndex, isLoading: loadingHealth } = useQuery({
        queryKey: ["healthIndex"],
        queryFn: api.healthIndex,
    });

    const { data: exclusionRisk, isLoading: loadingRisk } = useQuery({
        queryKey: ["exclusionRisk"],
        queryFn: api.exclusionRisk,
    });

    const { data: freshness, isLoading: loadingFresh } = useQuery({
        queryKey: ["freshness"],
        queryFn: api.biometricFreshness,
    });

    const { data: stateData } = useQuery({
        queryKey: ["enrollmentsByState"],
        queryFn: api.enrollmentsByState,
    });

    // Calculate national stats
    const avgHealth = healthIndex?.data?.length
        ? (healthIndex.data.reduce((acc: number, d: any) => acc + (d.health_index || 0), 0) / healthIndex.data.length).toFixed(1)
        : "—";

    const avgRisk = exclusionRisk?.data?.length
        ? (exclusionRisk.data.reduce((acc: number, d: any) => acc + (d.exclusion_risk || 0), 0) / exclusionRisk.data.length).toFixed(1)
        : "—";

    const avgFreshness = freshness?.data?.length
        ? Math.round(freshness.data.reduce((acc: number, d: any) => acc + (d.avg_days_since_update || 0), 0) / freshness.data.length)
        : "—";

    // Top states for chart
    const topStates = stateData?.slice(0, 10).map((s: any[], i: number) => ({
        name: s[0]?.substring(0, 12) || `State ${i}`,
        value: s[1] || 0
    })) || [];

    // Map data for choropleth
    const mapData = stateData?.map((s: any[]) => ({
        name: s[0] || "",
        value: s[1] || 0
    })) || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">National Overview</h1>
                    <p className="text-muted-foreground">Aadhaar enrollment and update health across India</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    Last updated: {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </div>
            </div>

            {/* KPI Cards with clear descriptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Aadhaar Health Index"
                    value={`${avgHealth}%`}
                    subtitle="Avg across all districts"
                    description={METRIC_DESCRIPTIONS.healthIndex}
                    icon={CheckCircle}
                    color="teal"
                />
                <KPICard
                    title="Exclusion Risk Score"
                    value={`${avgRisk}%`}
                    subtitle="Avg risk of service exclusion"
                    description={METRIC_DESCRIPTIONS.exclusionRisk}
                    icon={AlertCircle}
                    color="amber"
                />
                <KPICard
                    title="Biometric Update Age"
                    value={`${avgFreshness} days`}
                    subtitle="Avg days since last update"
                    description={METRIC_DESCRIPTIONS.biometricFreshness}
                    icon={Activity}
                    color="blue"
                />
                <KPICard
                    title="Districts Analyzed"
                    value={healthIndex?.data?.length || "—"}
                    subtitle="With complete data"
                    description="Total number of districts with sufficient data for analysis across all metrics."
                    icon={MapPin}
                    color="teal"
                />
                
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map Placeholder */}
                <GlassCard className="lg:col-span-2 h-[500px] overflow-hidden">
                    <div className="h-full">
                        <IndiaMap
                            data={mapData}
                            metric="enrollments"
                        />
                    </div>
                </GlassCard>

                {/* Side Panel */}
                <div className="space-y-6">
                    {/* Top States Chart */}
                    <GlassCard>
                        <SectionTitle subtitle="By total enrollments">Top States</SectionTitle>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topStates} layout="vertical" margin={{ left: 0, right: 20 }}>
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11, fill: "#8892a6" }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#141e32", border: "1px solid rgba(136,146,166,0.2)", borderRadius: "8px" }}
                                        labelStyle={{ color: "#e8edf5" }}
                                    />
                                    <Bar dataKey="value" fill="#00d4aa" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>

                    {/* Quick Actions */}
                    <GlassCard>
                        <SectionTitle>Quick Actions</SectionTitle>
                        <div className="space-y-2">
                            <Link href="/indices" className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                                <TrendingUp className="w-5 h-5 text-primary" />
                                <span className="text-sm">View Composite Indices</span>
                            </Link>
                            <Link href="/anomalies" className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                                <AlertCircle className="w-5 h-5 text-amber-400" />
                                <span className="text-sm">Explore Anomalies</span>
                            </Link>
                            <Link href="/clusters" className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                                <MapPin className="w-5 h-5 text-cyan-400" />
                                <span className="text-sm">Cluster Analysis</span>
                            </Link>
                           
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* Health Index Leaderboard */}
            <GlassCard>
                <SectionTitle subtitle="Districts ranked by composite health score (higher = better coverage & maintenance)">
                    Top Performing Districts
                </SectionTitle>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Rank</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">District</th>
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">State</th>
                                <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                                    <span title="Composite health score: Enrollment (40%) + Data Freshness (30%) + Updates (30%)">
                                        Health Index ⓘ
                                    </span>
                                </th>
                                <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                                    <span title="Score based on how recently biometric data was updated">
                                        Data Freshness ⓘ
                                    </span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {healthIndex?.data?.slice(0, 10).map((d: any, i: number) => (
                                <tr key={i} className="border-b border-border/50 hover:bg-secondary/30">
                                    <td className="py-3 px-4">
                                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${i < 3 ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                                            }`}>
                                            {i + 1}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 font-medium">{d.district}</td>
                                    <td className="py-3 px-4 text-muted-foreground">{d.state}</td>
                                    <td className="py-3 px-4 text-right">
                                        <span className="px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                                            {d.health_index?.toFixed(1)}%
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right text-muted-foreground">
                                        {d.freshness_pct?.toFixed(0)}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
}
