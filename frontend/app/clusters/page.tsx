"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Globe2, Layers } from "lucide-react";
import { GlassCard, SectionTitle } from "@/components/GlassCard";
import { api } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";

const CLUSTER_COLORS = {
    0: { bg: "bg-emerald-500/20", text: "text-emerald-400", name: "High Performers" },
    1: { bg: "bg-cyan-500/20", text: "text-cyan-400", name: "Moderate Coverage" },
    2: { bg: "bg-amber-500/20", text: "text-amber-400", name: "Needs Attention" },
    3: { bg: "bg-red-500/20", text: "text-red-400", name: "Critical" },
    4: { bg: "bg-purple-500/20", text: "text-purple-400", name: "Outliers" },
    noise: { bg: "bg-gray-500/20", text: "text-gray-400", name: "Unclustered" },
};

export default function ClustersPage() {
    const [clusterType, setClusterType] = useState<"cold" | "hot">("cold");
    const [selectedCluster, setSelectedCluster] = useState<number | null>(null);

    const { data: coldClusters, isLoading: loadingCold } = useQuery({
        queryKey: ["coldClusters"],
        queryFn: api.coldClusters,
    });

    const { data: hotClusters, isLoading: loadingHot } = useQuery({
        queryKey: ["hotClusters"],
        queryFn: api.hotClusters,
    });

    const clusters = clusterType === "cold" ? coldClusters?.clusters : hotClusters?.clusters;
    const description = clusterType === "cold"
        ? "DBSCAN clusters of low-enrollment pincodes"
        : "KMeans clusters of high-update activity pincodes";

    return (
        <>
            <Navbar />
            <div className="min-h-screen pt-20 px-6 pb-10 max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Globe2 className="w-8 h-8 text-primary" />
                        <h1 className="text-3xl font-bold">Cluster Explorer</h1>
                    </div>
                    <p className="text-muted-foreground">{description}</p>
                </div>

                {/* Toggle */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setClusterType("cold")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${clusterType === "cold" ? "bg-primary text-background" : "bg-secondary text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        Cold Clusters (DBSCAN)
                    </button>
                    <button
                        onClick={() => setClusterType("hot")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${clusterType === "hot" ? "bg-primary text-background" : "bg-secondary text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        Hot Clusters (KMeans)
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Cluster Legend */}
                    <GlassCard>
                        <SectionTitle>Cluster Types</SectionTitle>
                        <div className="space-y-3">
                            {clusters?.map((c: any, i: number) => {
                                const color = CLUSTER_COLORS[i as keyof typeof CLUSTER_COLORS] || CLUSTER_COLORS[4];
                                return (
                                    <button
                                        key={c.cluster}
                                        onClick={() => setSelectedCluster(selectedCluster === i ? null : i)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${selectedCluster === i ? "bg-primary/20 border border-primary/50" : "hover:bg-secondary/50"
                                            }`}
                                    >
                                        <div className={`w-4 h-4 rounded-full ${color.bg} ${color.text}`} />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Cluster {c.cluster}</p>
                                            <p className="text-xs text-muted-foreground">{c.count} pincodes</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </GlassCard>

                    {/* Map Placeholder */}
                    <GlassCard className="lg:col-span-2 h-[500px] flex items-center justify-center">
                        <div className="text-center">
                            <Layers className="w-16 h-16 text-primary mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Cluster Visualization</h3>
                            <p className="text-muted-foreground text-sm max-w-md">
                                Map highlighting districts by cluster assignment.
                                {selectedCluster !== null && ` Showing Cluster ${selectedCluster}`}
                            </p>
                        </div>
                    </GlassCard>

                    {/* Cluster Details */}
                    <GlassCard>
                        <SectionTitle>
                            {selectedCluster !== null ? `Cluster ${selectedCluster}` : "Select a Cluster"}
                        </SectionTitle>
                        {selectedCluster !== null && clusters?.[selectedCluster] ? (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Pincode Count</p>
                                    <p className="text-2xl font-bold">{clusters[selectedCluster].count}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">
                                        {clusterType === "cold" ? "Avg Enrollment" : "Avg Updates"}
                                    </p>
                                    <p className="text-xl font-bold">
                                        {clusterType === "cold"
                                            ? clusters[selectedCluster].avg_enrollment?.toFixed(0)
                                            : clusters[selectedCluster].avg_updates?.toFixed(0)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-2">States</p>
                                    <div className="flex flex-wrap gap-1">
                                        {clusters[selectedCluster].states?.slice(0, 5).map((s: string) => (
                                            <span key={s} className="px-2 py-1 rounded-md bg-secondary text-xs">{s}</span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-2">Sample Districts</p>
                                    <div className="space-y-1">
                                        {clusters[selectedCluster].districts?.slice(0, 5).map((d: string) => (
                                            <Link
                                                key={d}
                                                href={`/dashboard/district/${encodeURIComponent(d)}`}
                                                className="block text-sm hover:text-primary"
                                            >
                                                {d}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">Click on a cluster to see details</p>
                        )}
                    </GlassCard>
                </div>
            </div>
        </>
    );
}
