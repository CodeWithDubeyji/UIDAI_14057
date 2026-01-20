"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ChevronRight, MapPin, Users, Activity, AlertTriangle } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { GlassCard, SectionTitle } from "@/components/GlassCard";
import { api } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function StateView() {
    const params = useParams();
    const stateCode = decodeURIComponent(params.state_code as string).replace(/-/g, " ");

    const { data: healthIndex } = useQuery({
        queryKey: ["healthIndex"],
        queryFn: api.healthIndex,
    });

    const { data: exclusionRisk } = useQuery({
        queryKey: ["exclusionRisk"],
        queryFn: api.exclusionRisk,
    });

    // Filter data for this state
    const stateHealth = healthIndex?.data?.filter((d: any) =>
        d.state?.toLowerCase() === stateCode.toLowerCase()
    ) || [];

    const stateRisk = exclusionRisk?.data?.filter((d: any) =>
        d.state?.toLowerCase() === stateCode.toLowerCase()
    ) || [];

    const avgHealth = stateHealth.length
        ? (stateHealth.reduce((acc: number, d: any) => acc + (d.health_index || 0), 0) / stateHealth.length).toFixed(1)
        : "—";

    const avgRisk = stateRisk.length
        ? (stateRisk.reduce((acc: number, d: any) => acc + (d.exclusion_risk || 0), 0) / stateRisk.length).toFixed(1)
        : "—";

    const districtData = stateHealth.slice(0, 15).map((d: any) => ({
        name: d.district?.substring(0, 15) || "Unknown",
        health: d.health_index || 0,
        risk: stateRisk.find((r: any) => r.district === d.district)?.exclusion_risk || 0
    }));

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
                <Link href="/dashboard" className="text-muted-foreground hover:text-primary">India</Link>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-primary font-medium capitalize">{stateCode}</span>
            </div>

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold capitalize">{stateCode}</h1>
                <p className="text-muted-foreground">District-level Aadhaar analytics</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KPICard
                    title="State Health Index"
                    value={`${avgHealth}%`}
                    icon={Activity}
                    color="teal"
                />
                <KPICard
                    title="Exclusion Risk"
                    value={`${avgRisk}%`}
                    icon={AlertTriangle}
                    color="amber"
                />
                <KPICard
                    title="Districts"
                    value={stateHealth.length}
                    icon={MapPin}
                    color="blue"
                />
                <KPICard
                    title="Total Enrolled"
                    value={stateHealth.reduce((acc: number, d: any) => acc + (d.enrolled || 0), 0).toLocaleString()}
                    icon={Users}
                    color="teal"
                />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map Placeholder */}
                <GlassCard className="lg:col-span-2 h-[450px] flex items-center justify-center">
                    <div className="text-center">
                        <MapPin className="w-16 h-16 text-primary mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">District Map - {stateCode}</h3>
                        <p className="text-muted-foreground text-sm">Click on a district to view pincode details</p>
                        <div className="mt-6 flex flex-wrap gap-2 justify-center max-w-lg">
                            {stateHealth.slice(0, 8).map((d: any) => (
                                <Link
                                    key={d.district}
                                    href={`/dashboard/district/${encodeURIComponent(d.district)}`}
                                    className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm hover:bg-primary/20"
                                >
                                    {d.district}
                                </Link>
                            ))}
                        </div>
                    </div>
                </GlassCard>

                {/* District Chart */}
                <GlassCard>
                    <SectionTitle subtitle="By health index">Top Districts</SectionTitle>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={districtData} layout="vertical" margin={{ left: 0, right: 10 }}>
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10, fill: "#8892a6" }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#141e32", border: "1px solid rgba(136,146,166,0.2)", borderRadius: "8px" }}
                                />
                                <Bar dataKey="health" name="Health %" fill="#00d4aa" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>
            </div>

            {/* Districts Table */}
            <GlassCard>
                <SectionTitle>All Districts</SectionTitle>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-3 px-4 font-medium text-muted-foreground">District</th>
                                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Health Index</th>
                                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Exclusion Risk</th>
                                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stateHealth.map((d: any) => (
                                <tr key={d.district} className="border-b border-border/50 hover:bg-secondary/30">
                                    <td className="py-3 px-4 font-medium">{d.district}</td>
                                    <td className="py-3 px-4 text-right">
                                        <span className="px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-xs">
                                            {d.health_index?.toFixed(1)}%
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <span className="px-2 py-1 rounded-md bg-amber-500/20 text-amber-400 text-xs">
                                            {stateRisk.find((r: any) => r.district === d.district)?.exclusion_risk?.toFixed(1) || "—"}%
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <Link
                                            href={`/dashboard/district/${encodeURIComponent(d.district)}`}
                                            className="text-primary hover:underline text-xs"
                                        >
                                            View →
                                        </Link>
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
