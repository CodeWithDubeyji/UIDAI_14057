"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { BarChart3, ArrowUpDown, ChevronUp, ChevronDown, Info } from "lucide-react";
import { GlassCard, SectionTitle } from "@/components/GlassCard";
import { api } from "@/lib/api";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

type SortKey = "health_index" | "exclusion_risk" | "enrolled" | "freshness_pct";
type SortDir = "asc" | "desc";

const COLUMN_DESCRIPTIONS = {
    health_index: "Composite score (0-100): Enrollment Volume (40%) + Data Freshness (30%) + Update Activity (30%). Higher = better health.",
    exclusion_risk: "Risk of exclusion from Aadhaar-linked services (0-100). Combines enrollment gaps, outdated data, and update deserts. Higher = more risk.",
    enrolled: "Total number of Aadhaar enrollments in this district.",
    freshness_pct: "Score indicating how recently biometric updates were performed (0-100). Higher = more recent updates.",
};

export default function IndicesPage() {
    const [sortKey, setSortKey] = useState<SortKey>("health_index");
    const [sortDir, setSortDir] = useState<SortDir>("desc");

    const { data: healthIndex, isLoading } = useQuery({
        queryKey: ["healthIndex"],
        queryFn: api.healthIndex,
    });

    const { data: exclusionRisk } = useQuery({
        queryKey: ["exclusionRisk"],
        queryFn: api.exclusionRisk,
    });

    // Merge data
    const mergedData = healthIndex?.data?.map((h: any) => {
        const risk = exclusionRisk?.data?.find((r: any) => r.district === h.district && r.state === h.state);
        return { ...h, exclusion_risk: risk?.exclusion_risk || 0 };
    }) || [];

    // Sort
    const sortedData = [...mergedData].sort((a, b) => {
        const aVal = a[sortKey] || 0;
        const bVal = b[sortKey] || 0;
        return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir(sortDir === "desc" ? "asc" : "desc");
        } else {
            setSortKey(key);
            setSortDir("desc");
        }
    };

    const SortIcon = ({ column }: { column: SortKey }) => {
        if (sortKey !== column) return <ArrowUpDown className="w-3 h-3 text-muted-foreground" />;
        return sortDir === "desc" ? <ChevronDown className="w-3 h-3 text-primary" /> : <ChevronUp className="w-3 h-3 text-primary" />;
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen pt-20 px-6 pb-10 max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <BarChart3 className="w-8 h-8 text-primary" />
                        <h1 className="text-3xl font-bold">Composite Indices</h1>
                    </div>
                    <p className="text-muted-foreground">
                        District-level leaderboard ranked by Aadhaar Health Index and Exclusion Risk
                    </p>
                </div>

                {/* Legend explaining metrics */}
                <GlassCard className="mb-6" padding="sm">
                    <div className="flex items-center gap-2 mb-3">
                        <Info className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Metric Definitions</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                        <div>
                            <span className="text-foreground font-medium">Health Index:</span> Composite score measuring overall Aadhaar ecosystem health. Combines enrollment volume (40%), data freshness (30%), and update activity (30%). Higher = better.
                        </div>
                        <div>
                            <span className="text-foreground font-medium">Exclusion Risk:</span> Risk of residents being excluded from Aadhaar-linked services. Combines enrollment gaps (40%), data staleness (35%), and update deserts (25%). Higher = more at risk.
                        </div>
                    </div>
                </GlassCard>

                <GlassCard>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-4 px-4 font-medium text-muted-foreground">Rank</th>
                                    <th className="text-left py-4 px-4 font-medium text-muted-foreground">District</th>
                                    <th className="text-left py-4 px-4 font-medium text-muted-foreground">State</th>
                                    <th className="text-right py-4 px-4 font-medium cursor-pointer hover:text-primary" onClick={() => handleSort("health_index")} title={COLUMN_DESCRIPTIONS.health_index}>
                                        <span className="inline-flex items-center gap-1">Health Index <SortIcon column="health_index" /></span>
                                    </th>
                                    <th className="text-right py-4 px-4 font-medium cursor-pointer hover:text-primary" onClick={() => handleSort("exclusion_risk")} title={COLUMN_DESCRIPTIONS.exclusion_risk}>
                                        <span className="inline-flex items-center gap-1">Exclusion Risk <SortIcon column="exclusion_risk" /></span>
                                    </th>
                                    <th className="text-right py-4 px-4 font-medium cursor-pointer hover:text-primary" onClick={() => handleSort("enrolled")} title={COLUMN_DESCRIPTIONS.enrolled}>
                                        <span className="inline-flex items-center gap-1">Enrollments <SortIcon column="enrolled" /></span>
                                    </th>
                                    <th className="text-right py-4 px-4 font-medium cursor-pointer hover:text-primary" onClick={() => handleSort("freshness_pct")} title={COLUMN_DESCRIPTIONS.freshness_pct}>
                                        <span className="inline-flex items-center gap-1">Data Freshness <SortIcon column="freshness_pct" /></span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedData.slice(0, 100).map((d: any, i: number) => (
                                    <tr key={`${d.district}-${d.state}`} className="border-b border-border/50 hover:bg-secondary/30">
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${i < 3 ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                                                }`}>
                                                {i + 1}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Link href={`/dashboard/district/${encodeURIComponent(d.district)}`} className="font-medium hover:text-primary">
                                                {d.district}
                                            </Link>
                                        </td>
                                        <td className="py-3 px-4 text-muted-foreground">{d.state}</td>
                                        <td className="py-3 px-4 text-right">
                                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${d.health_index >= 70 ? "bg-emerald-500/20 text-emerald-400" :
                                                    d.health_index >= 40 ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"
                                                }`}>
                                                {d.health_index?.toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${d.exclusion_risk <= 30 ? "bg-emerald-500/20 text-emerald-400" :
                                                    d.exclusion_risk <= 60 ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"
                                                }`}>
                                                {d.exclusion_risk?.toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right text-muted-foreground">
                                            {d.enrolled?.toLocaleString() || "—"}
                                        </td>
                                        <td className="py-3 px-4 text-right text-muted-foreground">
                                            {d.freshness_pct?.toFixed(0) || "—"}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            </div>
        </>
    );
}
