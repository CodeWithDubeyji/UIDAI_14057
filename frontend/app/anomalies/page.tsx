"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Zap, Ghost, Users, MapPin } from "lucide-react";
import { GlassCard, SectionTitle } from "@/components/GlassCard";
import { api } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";

export default function AnomaliesPage() {
    const { data: mirage } = useQuery({ queryKey: ["mirage"], queryFn: api.enrollmentMirage });
    const { data: phantom } = useQuery({ queryKey: ["phantom"], queryFn: api.phantomChildren });
    const { data: ghosts } = useQuery({ queryKey: ["ghosts"], queryFn: api.ghostTowns });
    const { data: zscore } = useQuery({ queryKey: ["zscore"], queryFn: api.enrollmentZscore });
    const { data: bulk } = useQuery({ queryKey: ["bulk"], queryFn: api.bulkDays });

    const anomalyTypes = [
        { key: "mirage", icon: Zap, title: "Enrollment Mirages", count: mirage?.data?.length || 0, color: "text-amber-400", desc: "High enrollments with suspiciously low update activity" },
        { key: "phantom", icon: Users, title: "Phantom Children", count: phantom?.data?.length || 0, color: "text-purple-400", desc: "Child enrollments without subsequent biometric updates" },
        { key: "ghosts", icon: Ghost, title: "Ghost Towns", count: ghosts?.count || 0, color: "text-red-400", desc: "Pincodes with no activity for 2+ years" },
        { key: "zscore", icon: AlertTriangle, title: "Z-Score Outliers", count: zscore?.data?.length || 0, color: "text-cyan-400", desc: "Enrollment counts significantly different from district average" },
    ];

    return (
        <>
            <Navbar />
            <div className="min-h-screen pt-20 px-6 pb-10 max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="w-8 h-8 text-amber-400" />
                        <h1 className="text-3xl font-bold">Anomaly Lab</h1>
                    </div>
                    <p className="text-muted-foreground">Detect unusual patterns and data quality issues</p>
                </div>

                {/* Anomaly Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {anomalyTypes.map((a) => (
                        <GlassCard key={a.key} hover>
                            <div className="flex items-start gap-3">
                                <a.icon className={`w-8 h-8 ${a.color}`} />
                                <div>
                                    <h3 className="font-semibold">{a.title}</h3>
                                    <p className="text-2xl font-bold mt-1">{a.count}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{a.desc}</p>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Enrollment Mirages */}
                    <GlassCard>
                        <SectionTitle subtitle="High enrollment, low update ratio">
                            <span className="flex items-center gap-2"><Zap className="w-5 h-5 text-amber-400" /> Enrollment Mirages</span>
                        </SectionTitle>
                        <div className="max-h-80 overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-card">
                                    <tr className="border-b border-border">
                                        <th className="text-left py-2 px-3">Pincode</th>
                                        <th className="text-left py-2 px-3">District</th>
                                        <th className="text-right py-2 px-3">Enrolled</th>
                                        <th className="text-right py-2 px-3">Ratio</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mirage?.data?.slice(0, 15).map((d: any) => (
                                        <tr key={d.pincode} className="border-b border-border/30 hover:bg-secondary/30">
                                            <td className="py-2 px-3">{d.pincode}</td>
                                            <td className="py-2 px-3 text-muted-foreground">{d.district}</td>
                                            <td className="py-2 px-3 text-right">{d.enrolled?.toLocaleString()}</td>
                                            <td className="py-2 px-3 text-right">
                                                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs">{(d.ratio * 100)?.toFixed(1)}%</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>

                    {/* Phantom Children */}
                    <GlassCard>
                        <SectionTitle subtitle="0-5 age enrollments without bio updates">
                            <span className="flex items-center gap-2"><Users className="w-5 h-5 text-purple-400" /> Phantom Children</span>
                        </SectionTitle>
                        <div className="max-h-80 overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-card">
                                    <tr className="border-b border-border">
                                        <th className="text-left py-2 px-3">District</th>
                                        <th className="text-left py-2 px-3">State</th>
                                        <th className="text-right py-2 px-3">Phantom</th>
                                        <th className="text-right py-2 px-3">%</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {phantom?.data?.slice(0, 15).map((d: any) => (
                                        <tr key={`${d.district}-${d.state}`} className="border-b border-border/30 hover:bg-secondary/30">
                                            <td className="py-2 px-3">
                                                <Link href={`/dashboard/district/${encodeURIComponent(d.district)}`} className="hover:text-primary">{d.district}</Link>
                                            </td>
                                            <td className="py-2 px-3 text-muted-foreground">{d.state}</td>
                                            <td className="py-2 px-3 text-right">{d.phantom?.toLocaleString()}</td>
                                            <td className="py-2 px-3 text-right">
                                                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 text-xs">{d.pct?.toFixed(1)}%</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>

                    {/* Ghost Towns */}
                    <GlassCard>
                        <SectionTitle subtitle="Pincodes with no activity for 2+ years">
                            <span className="flex items-center gap-2"><Ghost className="w-5 h-5 text-red-400" /> Ghost Towns</span>
                        </SectionTitle>
                        <div className="max-h-80 overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-card">
                                    <tr className="border-b border-border">
                                        <th className="text-left py-2 px-3">Pincode</th>
                                        <th className="text-left py-2 px-3">District</th>
                                        <th className="text-right py-2 px-3">Enrolled</th>
                                        <th className="text-right py-2 px-3">Last Bio</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ghosts?.data?.slice(0, 15).map((d: any) => (
                                        <tr key={d.pincode} className="border-b border-border/30 hover:bg-secondary/30">
                                            <td className="py-2 px-3">{d.pincode}</td>
                                            <td className="py-2 px-3 text-muted-foreground">{d.district}</td>
                                            <td className="py-2 px-3 text-right">{d.enrolled?.toLocaleString()}</td>
                                            <td className="py-2 px-3 text-right text-xs text-muted-foreground">{d.last_bio || "Never"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>

                    {/* Bulk Days */}
                    <GlassCard>
                        <SectionTitle subtitle="Days with 3σ+ above avg enrollments">
                            <span className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-cyan-400" /> Bulk Enrollment Days</span>
                        </SectionTitle>
                        <div className="max-h-80 overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-card">
                                    <tr className="border-b border-border">
                                        <th className="text-left py-2 px-3">Date</th>
                                        <th className="text-right py-2 px-3">Total</th>
                                        <th className="text-right py-2 px-3">Avg</th>
                                        <th className="text-right py-2 px-3">σ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bulk?.data?.slice(0, 15).map((d: any) => (
                                        <tr key={d.date} className="border-b border-border/30 hover:bg-secondary/30">
                                            <td className="py-2 px-3">{d.date}</td>
                                            <td className="py-2 px-3 text-right font-medium">{d.total?.toLocaleString()}</td>
                                            <td className="py-2 px-3 text-right text-muted-foreground">{d.avg?.toLocaleString()}</td>
                                            <td className="py-2 px-3 text-right">
                                                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-xs">{d.sigma}σ</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </>
    );
}
