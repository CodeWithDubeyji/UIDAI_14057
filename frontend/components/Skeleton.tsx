"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
    className?: string;
}

// Base skeleton with shimmer animation
export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-lg bg-secondary/50",
                className
            )}
        />
    );
}

// Skeleton for KPI Card
export function SkeletonKPICard() {
    return (
        <div className="p-6 rounded-xl bg-card/50 border border-border/50 backdrop-blur">
            <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="w-12 h-12 rounded-xl" />
            </div>
        </div>
    );
}

// Skeleton for GlassCard with chart
export function SkeletonChartCard({ height = "h-80" }: { height?: string }) {
    return (
        <div className="p-6 rounded-xl bg-card/50 border border-border/50 backdrop-blur">
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-3 w-56" />
                    </div>
                </div>
                <Skeleton className={cn(height, "w-full rounded-lg")} />
            </div>
        </div>
    );
}

// Skeleton for table rows
export function SkeletonTableRow() {
    return (
        <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/20">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-32 flex-1" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
        </div>
    );
}

// Skeleton for list items
export function SkeletonListItem() {
    return (
        <div className="p-4 rounded-lg bg-secondary/30">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4 rounded" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-4 w-20" />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
                <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-2 w-full rounded-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-2 w-full rounded-full" />
                </div>
            </div>
        </div>
    );
}

// Skeleton for Map component
export function SkeletonMap({ height = "500px" }: { height?: string }) {
    return (
        <div
            className="rounded-xl bg-card/50 border border-border/50 backdrop-blur overflow-hidden relative"
            style={{ height }}
        >
            <Skeleton className="absolute inset-0" />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin mx-auto mb-4" />
                    <Skeleton className="h-4 w-32 mx-auto" />
                </div>
            </div>
        </div>
    );
}

// Full page skeleton for Trends page
export function SkeletonTrendsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <Skeleton className="h-4 w-40" />
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonKPICard key={i} />
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SkeletonChartCard />
                <SkeletonChartCard />
            </div>

            {/* Full Width Chart */}
            <SkeletonChartCard />

            {/* Lists Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl bg-card/50 border border-border/50 backdrop-blur space-y-3">
                    <Skeleton className="h-5 w-48 mb-4" />
                    {Array.from({ length: 5 }).map((_, i) => (
                        <SkeletonListItem key={i} />
                    ))}
                </div>
                <div className="p-6 rounded-xl bg-card/50 border border-border/50 backdrop-blur space-y-3">
                    <Skeleton className="h-5 w-40 mb-4" />
                    {Array.from({ length: 5 }).map((_, i) => (
                        <SkeletonListItem key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Full page skeleton for Dashboard page
export function SkeletonDashboardPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-56" />
                <Skeleton className="h-4 w-80" />
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonKPICard key={i} />
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map */}
                <div className="lg:col-span-2">
                    <SkeletonMap height="500px" />
                </div>
                {/* Side Panel */}
                <div className="space-y-6">
                    <SkeletonChartCard height="h-48" />
                    <div className="p-6 rounded-xl bg-card/50 border border-border/50 backdrop-blur space-y-3">
                        <Skeleton className="h-5 w-40 mb-4" />
                        {Array.from({ length: 5 }).map((_, i) => (
                            <SkeletonTableRow key={i} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Full page skeleton for Indices page
export function SkeletonIndicesPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-72" />
            </div>

            {/* Metrics Definitions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="p-6 rounded-xl bg-card/50 border border-border/50 backdrop-blur">
                        <Skeleton className="h-5 w-40 mb-2" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-3/4 mt-1" />
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="p-6 rounded-xl bg-card/50 border border-border/50 backdrop-blur">
                <Skeleton className="h-5 w-40 mb-4" />
                <div className="space-y-2">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <SkeletonTableRow key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Full page skeleton for Clusters page
export function SkeletonClustersPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-80" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-24 rounded-lg" />
                    <Skeleton className="h-10 w-24 rounded-lg" />
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cluster Legend */}
                <div className="p-6 rounded-xl bg-card/50 border border-border/50 backdrop-blur space-y-3">
                    <Skeleton className="h-5 w-32 mb-4" />
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20">
                            <Skeleton className="w-4 h-4 rounded-full" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-12 ml-auto" />
                        </div>
                    ))}
                </div>

                {/* Map */}
                <div className="lg:col-span-2">
                    <SkeletonMap height="500px" />
                </div>
            </div>
        </div>
    );
}

// Full page skeleton for Anomalies page  
export function SkeletonAnomaliesPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-4 w-72" />
            </div>

            {/* Anomaly Type Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="p-6 rounded-xl bg-card/50 border border-border/50 backdrop-blur">
                        <Skeleton className="w-10 h-10 rounded-lg mb-3" />
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-8 w-20 mb-2" />
                        <Skeleton className="h-3 w-full" />
                    </div>
                ))}
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="p-6 rounded-xl bg-card/50 border border-border/50 backdrop-blur">
                        <Skeleton className="h-5 w-40 mb-4" />
                        <div className="space-y-2">
                            {Array.from({ length: 5 }).map((_, j) => (
                                <SkeletonTableRow key={j} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Full page skeleton for Compare page
export function SkeletonComparePage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>

            {/* District Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="p-6 rounded-xl bg-card/50 border border-border/50 backdrop-blur">
                        <Skeleton className="h-5 w-24 mb-3" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                ))}
            </div>

            {/* Comparison Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Radar Chart */}
                <SkeletonChartCard height="h-96" />

                {/* Metric Cards */}
                <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur">
                            <Skeleton className="h-4 w-32 mb-3" />
                            <div className="grid grid-cols-2 gap-4">
                                <Skeleton className="h-8 w-20" />
                                <Skeleton className="h-8 w-20" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
