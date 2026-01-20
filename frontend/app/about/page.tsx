"use client";

import { Globe2, BarChart3, Shield, Zap, Code, Database, MapPin } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";

export default function AboutPage() {
    return (
        <>
            <Navbar />
            <div className="min-h-screen pt-20 px-6 pb-10 max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-teal mb-6">
                        <Globe2 className="w-10 h-10 text-background" />
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Aadhaar Insight Atlas</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        An interactive geospatial analytics platform for exploring Aadhaar enrollment,
                        biometric updates, and demographic trends across India.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <GlassCard>
                        <MapPin className="w-8 h-8 text-primary mb-4" />
                        <h3 className="font-semibold text-lg mb-2">Geospatial Drill-Down</h3>
                        <p className="text-sm text-muted-foreground">
                            Explore data hierarchically from national overview to individual pincodes.
                            Click through states, districts, and pincodes with smooth transitions.
                        </p>
                    </GlassCard>
                    <GlassCard>
                        <BarChart3 className="w-8 h-8 text-cyan-400 mb-4" />
                        <h3 className="font-semibold text-lg mb-2">32 Analytics Metrics</h3>
                        <p className="text-sm text-muted-foreground">
                            Comprehensive metrics covering enrollment coverage, update health,
                            geospatial patterns, temporal trends, and anomaly detection.
                        </p>
                    </GlassCard>
                    <GlassCard>
                        <Shield className="w-8 h-8 text-amber-400 mb-4" />
                        <h3 className="font-semibold text-lg mb-2">Exclusion Risk Tracking</h3>
                        <p className="text-sm text-muted-foreground">
                            Composite indices identify underserved regions and populations
                            at risk of digital exclusion from Aadhaar-linked services.
                        </p>
                    </GlassCard>
                    <GlassCard>
                        <Zap className="w-8 h-8 text-purple-400 mb-4" />
                        <h3 className="font-semibold text-lg mb-2">Anomaly Detection</h3>
                        <p className="text-sm text-muted-foreground">
                            Discover unusual patterns like enrollment mirages, phantom children,
                            ghost towns, and statistical outliers for data quality insights.
                        </p>
                    </GlassCard>
                </div>

                {/* Tech Stack */}
                <GlassCard className="mb-12">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <Code className="w-5 h-5 text-primary" />
                        Technology Stack
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { name: "Next.js 16", desc: "React Framework" },
                            { name: "TailwindCSS 4", desc: "Styling" },
                            { name: "Recharts", desc: "Visualizations" },
                            { name: "Framer Motion", desc: "Animations" },
                            { name: "FastAPI", desc: "Backend API" },
                            { name: "DuckDB", desc: "Analytics DB" },
                            { name: "React Query", desc: "Data Fetching" },
                            { name: "scikit-learn", desc: "ML Clustering" },
                        ].map((tech) => (
                            <div key={tech.name} className="p-3 rounded-lg bg-secondary/30">
                                <p className="font-medium text-sm">{tech.name}</p>
                                <p className="text-xs text-muted-foreground">{tech.desc}</p>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                {/* Metrics Categories */}
                <GlassCard className="mb-12">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <Database className="w-5 h-5 text-primary" />
                        Analytics Categories
                    </h3>
                    <div className="space-y-3">
                        {[
                            { name: "Data Insights", count: 5, items: "Enrollment Deficit, Age Cohort Imbalance, Gini Coefficient" },
                            { name: "Update Health", count: 5, items: "Biometric Freshness, Demographic Staleness, Transition Rates" },
                            { name: "Geospatial", count: 5, items: "Cold Clusters (DBSCAN), Hot Clusters (KMeans), Moran's I" },
                            { name: "Temporal", count: 5, items: "Monsoon Spikes, Enrollment Velocity, Seasonality Index" },
                            { name: "Anomaly", count: 5, items: "Z-Score Outliers, Bulk Days, Orphan Updates" },
                            { name: "Composite", count: 2, items: "Health Index, Exclusion Risk Index" },
                            { name: "Crazy Insights", count: 5, items: "Phantom Children, District Twins, Ghost Towns" },
                        ].map((cat) => (
                            <div key={cat.name} className="flex items-start gap-4 p-3 rounded-lg hover:bg-secondary/30">
                                <span className="px-2 py-1 rounded bg-primary/20 text-primary text-xs font-bold">{cat.count}</span>
                                <div>
                                    <p className="font-medium text-sm">{cat.name}</p>
                                    <p className="text-xs text-muted-foreground">{cat.items}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                {/* CTA */}
                <div className="text-center">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-teal text-background font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all"
                    >
                        <Globe2 className="w-5 h-5" />
                        Explore Dashboard
                    </Link>
                </div>
            </div>
        </>
    );
}
