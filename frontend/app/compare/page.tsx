"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { GitCompare, Search } from "lucide-react";
import { GlassCard, SectionTitle } from "@/components/GlassCard";
import { SkeletonComparePage } from "@/components/Skeleton";
import { api } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from "recharts";

export default function ComparePage() {
    const [district1, setDistrict1] = useState("");
    const [district2, setDistrict2] = useState("");
    const [search1, setSearch1] = useState("");
    const [search2, setSearch2] = useState("");

    const { data: healthIndex } = useQuery({ queryKey: ["healthIndex"], queryFn: api.healthIndex });
    const { data: exclusionRisk } = useQuery({ queryKey: ["exclusionRisk"], queryFn: api.exclusionRisk });
    const { data: freshness } = useQuery({ queryKey: ["freshness"], queryFn: api.biometricFreshness });

    const districts = healthIndex?.data?.map((d: any) => d.district) || [];
    const filtered1 = districts.filter((d: string) => d.toLowerCase().includes(search1.toLowerCase())).slice(0, 8);
    const filtered2 = districts.filter((d: string) => d.toLowerCase().includes(search2.toLowerCase())).slice(0, 8);

    const getData = (district: string) => {
        const h = healthIndex?.data?.find((d: any) => d.district === district);
        const r = exclusionRisk?.data?.find((d: any) => d.district === district);
        const f = freshness?.data?.find((d: any) => d.district === district);
        return {
            health: h?.health_index || 0,
            freshness: h?.freshness_pct || 0,
            update: h?.update_pct || 0,
            enrolled: h?.enrolled || 0,
            exclusion: r?.exclusion_risk || 0,
            staleness: r?.staleness_pct || 0,
            state: h?.state || "",
        };
    };

    const d1Data = getData(district1);
    const d2Data = getData(district2);

    const radarData = [
        { metric: "Health Index", d1: d1Data.health, d2: d2Data.health },
        { metric: "Freshness", d1: d1Data.freshness, d2: d2Data.freshness },
        { metric: "Update Rate", d1: d1Data.update, d2: d2Data.update },
        { metric: "100 - Risk", d1: 100 - d1Data.exclusion, d2: 100 - d2Data.exclusion },
        { metric: "100 - Stale", d1: 100 - d1Data.staleness, d2: 100 - d2Data.staleness },
    ];

    const isLoading = !healthIndex?.data;

    if (isLoading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen pt-20 px-6 pb-10 max-w-7xl mx-auto">
                    <SkeletonComparePage />
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen pt-20 px-6 pb-10 max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <GitCompare className="w-8 h-8 text-primary" />
                        <h1 className="text-3xl font-bold">Comparison Studio</h1>
                    </div>
                    <p className="text-muted-foreground">Compare metrics between any two districts</p>
                </div>

                {/* District Selectors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* District 1 */}
                    <GlassCard>
                        <SectionTitle>District 1</SectionTitle>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search districts..."
                                value={search1}
                                onChange={(e) => setSearch1(e.target.value)}
                                className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm"
                            />
                        </div>
                        {search1 && !district1 && (
                            <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                                {filtered1.map((d: string) => (
                                    <button key={d} onClick={() => { setDistrict1(d); setSearch1(""); }}
                                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary/50 text-sm">
                                        {d}
                                    </button>
                                ))}
                            </div>
                        )}
                        {district1 && (
                            <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/30">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-semibold">{district1}</h4>
                                    <button onClick={() => setDistrict1("")} className="text-xs text-muted-foreground hover:text-foreground">Change</button>
                                </div>
                                <p className="text-sm text-muted-foreground">{d1Data.state}</p>
                            </div>
                        )}
                    </GlassCard>

                    {/* District 2 */}
                    <GlassCard>
                        <SectionTitle>District 2</SectionTitle>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search districts..."
                                value={search2}
                                onChange={(e) => setSearch2(e.target.value)}
                                className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm"
                            />
                        </div>
                        {search2 && !district2 && (
                            <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                                {filtered2.map((d: string) => (
                                    <button key={d} onClick={() => { setDistrict2(d); setSearch2(""); }}
                                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary/50 text-sm">
                                        {d}
                                    </button>
                                ))}
                            </div>
                        )}
                        {district2 && (
                            <div className="mt-4 p-4 rounded-lg bg-accent/10 border border-accent/30">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-semibold">{district2}</h4>
                                    <button onClick={() => setDistrict2("")} className="text-xs text-muted-foreground hover:text-foreground">Change</button>
                                </div>
                                <p className="text-sm text-muted-foreground">{d2Data.state}</p>
                            </div>
                        )}
                    </GlassCard>
                </div>

                {/* Comparison Charts */}
                {district1 && district2 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Radar Chart */}
                        <GlassCard>
                            <SectionTitle>Radar Comparison</SectionTitle>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart data={radarData}>
                                        <PolarGrid stroke="#8892a6" strokeOpacity={0.3} />
                                        <PolarAngleAxis dataKey="metric" tick={{ fill: "#8892a6", fontSize: 11 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#8892a6", fontSize: 10 }} />
                                        <Radar name={district1} dataKey="d1" stroke="#00d4aa" fill="#00d4aa" fillOpacity={0.3} />
                                        <Radar name={district2} dataKey="d2" stroke="#00b8d4" fill="#00b8d4" fillOpacity={0.3} />
                                        <Legend />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </GlassCard>

                        {/* Comparison Cards */}
                        <GlassCard>
                            <SectionTitle>Side-by-Side Metrics</SectionTitle>
                            <div className="space-y-4">
                                {[
                                    { label: "Health Index", v1: d1Data.health, v2: d2Data.health, unit: "%" },
                                    { label: "Exclusion Risk", v1: d1Data.exclusion, v2: d2Data.exclusion, unit: "%", invert: true },
                                    { label: "Freshness", v1: d1Data.freshness, v2: d2Data.freshness, unit: "%" },
                                    { label: "Update Rate", v1: d1Data.update, v2: d2Data.update, unit: "%" },
                                    { label: "Enrolled", v1: d1Data.enrolled, v2: d2Data.enrolled },
                                ].map(({ label, v1, v2, unit, invert }) => {
                                    const better1 = invert ? v1 < v2 : v1 > v2;
                                    return (
                                        <div key={label} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                                            <span className="text-sm font-medium">{label}</span>
                                            <div className="flex items-center gap-4">
                                                <span className={`text-sm font-bold ${better1 ? "text-emerald-400" : "text-muted-foreground"}`}>
                                                    {typeof v1 === "number" ? (unit ? `${v1.toFixed(1)}${unit}` : v1.toLocaleString()) : "-"}
                                                </span>
                                                <span className="text-xs text-muted-foreground">vs</span>
                                                <span className={`text-sm font-bold ${!better1 ? "text-emerald-400" : "text-muted-foreground"}`}>
                                                    {typeof v2 === "number" ? (unit ? `${v2.toFixed(1)}${unit}` : v2.toLocaleString()) : "-"}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </GlassCard>
                    </div>
                )}
            </div>
        </>
    );
}
