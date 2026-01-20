"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, MapPin, Users, Activity, AlertTriangle, Download, TrendingUp, TrendingDown } from "lucide-react";
import { KPICard, METRIC_DESCRIPTIONS } from "@/components/KPICard";
import { GlassCard, SectionTitle } from "@/components/GlassCard";
import { api } from "@/lib/api";

export default function DistrictView() {
    const params = useParams();
    const districtCode = decodeURIComponent(params.district_code as string);

    const { data: healthIndex } = useQuery({
        queryKey: ["healthIndex"],
        queryFn: api.healthIndex,
    });

    const { data: exclusionRisk } = useQuery({
        queryKey: ["exclusionRisk"],
        queryFn: api.exclusionRisk,
    });

    const { data: freshness } = useQuery({
        queryKey: ["freshness"],
        queryFn: api.biometricFreshness,
    });

    const { data: staleness } = useQuery({
        queryKey: ["staleness"],
        queryFn: api.demographicStaleness,
    });

    // Find district data
    const districtHealth = healthIndex?.data?.find((d: any) => d.district === districtCode);
    const districtRisk = exclusionRisk?.data?.find((d: any) => d.district === districtCode);
    const districtFresh = freshness?.data?.find((d: any) => d.district === districtCode);
    const districtStale = staleness?.data?.find((d: any) => d.district === districtCode);

    const state = districtHealth?.state || "Unknown";

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
                <Link href="/dashboard" className="text-muted-foreground hover:text-primary">India</Link>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <Link href={`/dashboard/state/${encodeURIComponent(state.toLowerCase().replace(/ /g, "-"))}`}
                    className="text-muted-foreground hover:text-primary">{state}</Link>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-primary font-medium">{districtCode}</span>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{districtCode}</h1>
                    <p className="text-muted-foreground">{state} • Pincode-level analytics</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 text-sm">
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>

            {/* KPI Cards with clear descriptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Health Index"
                    value={`${districtHealth?.health_index?.toFixed(1) || "—"}%`}
                    subtitle="Overall ecosystem health"
                    description={METRIC_DESCRIPTIONS.healthIndex}
                    icon={Activity}
                    color="teal"
                />
                <KPICard
                    title="Exclusion Risk"
                    value={`${districtRisk?.exclusion_risk?.toFixed(1) || "—"}%`}
                    subtitle="Risk of service exclusion"
                    description={METRIC_DESCRIPTIONS.exclusionRisk}
                    icon={AlertTriangle}
                    color="amber"
                />
                <KPICard
                    title="Biometric Update Age"
                    value={`${Math.round(districtFresh?.avg_days_since_update || 0)} days`}
                    subtitle="Since last biometric update"
                    description={METRIC_DESCRIPTIONS.biometricFreshness}
                    icon={TrendingUp}
                    color="blue"
                />
                <KPICard
                    title="Demographic Staleness"
                    value={`${districtStale?.staleness_pct?.toFixed(1) || "—"}%`}
                    subtitle="Outdated address/DOB records"
                    description={METRIC_DESCRIPTIONS.demographicStaleness}
                    icon={TrendingDown}
                    color="red"
                />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map Placeholder */}
                <GlassCard className="lg:col-span-2 h-[400px] flex items-center justify-center">
                    <div className="text-center">
                        <MapPin className="w-16 h-16 text-primary mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Pincode Density Map</h3>
                        <p className="text-muted-foreground text-sm">
                            Hexbin visualization of enrollment distribution across pincodes
                        </p>
                    </div>
                </GlassCard>

                {/* Metrics Panel */}
                <div className="space-y-4">
                    <GlassCard padding="sm">
                        <h4 className="text-sm font-medium text-muted-foreground mb-3">Detailed Metrics</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-border/50">
                                <span className="text-sm">Total Enrollments</span>
                                <span className="font-medium">{districtHealth?.enrolled?.toLocaleString() || "—"}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-border/50">
                                <span className="text-sm" title="Score based on how recently data was updated">Data Freshness Score</span>
                                <span className="font-medium">{districtHealth?.freshness_pct?.toFixed(1) || "—"}%</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-border/50">
                                <span className="text-sm" title="Ratio of updates to enrollments">Update Activity Rate</span>
                                <span className="font-medium">{districtHealth?.update_pct?.toFixed(1) || "—"}%</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-border/50">
                                <span className="text-sm" title="Gap between expected and actual enrollments">Enrollment Deficit</span>
                                <span className="font-medium">{districtRisk?.deficit_pct?.toFixed(1) || "—"}%</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm" title="Pincodes with no demographic updates in 12 months">Update Desert Areas</span>
                                <span className="font-medium">{districtRisk?.desert_pct?.toFixed(1) || "—"}%</span>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard padding="sm">
                        <h4 className="text-sm font-medium text-muted-foreground mb-3">Status Indicators</h4>
                        <div className="flex flex-wrap gap-2">
                            {districtHealth?.health_index > 70 && (
                                <span className="badge-success px-3 py-1 rounded-full text-xs">Good Coverage</span>
                            )}
                            {districtRisk?.exclusion_risk > 50 && (
                                <span className="badge-danger px-3 py-1 rounded-full text-xs">High Exclusion Risk</span>
                            )}
                            {districtStale?.staleness_pct > 30 && (
                                <span className="badge-warning px-3 py-1 rounded-full text-xs">Outdated Records</span>
                            )}
                            {districtFresh?.avg_days_since_update < 180 && (
                                <span className="badge-info px-3 py-1 rounded-full text-xs">Recently Updated</span>
                            )}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
