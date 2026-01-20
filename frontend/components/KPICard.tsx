"use client";

import { motion } from "framer-motion";
import { LucideIcon, Info } from "lucide-react";
import { useState } from "react";

interface KPICardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    description?: string; // Full explanation of what this metric means
    icon?: LucideIcon;
    trend?: "up" | "down" | "neutral";
    trendValue?: string;
    color?: "teal" | "amber" | "red" | "blue";
}

const colorMap = {
    teal: "from-teal-500/20 to-cyan-500/10 border-teal-500/30",
    amber: "from-amber-500/20 to-orange-500/10 border-amber-500/30",
    red: "from-red-500/20 to-rose-500/10 border-red-500/30",
    blue: "from-blue-500/20 to-indigo-500/10 border-blue-500/30",
};

const iconColorMap = {
    teal: "text-teal-400",
    amber: "text-amber-400",
    red: "text-red-400",
    blue: "text-blue-400",
};

export function KPICard({
    title,
    value,
    subtitle,
    description,
    icon: Icon,
    trend,
    trendValue,
    color = "teal"
}: KPICardProps) {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`kpi-card p-5 bg-gradient-to-br ${colorMap[color]} border relative`}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground font-medium">{title}</p>
                        {description && (
                            <div className="relative">
                                <button
                                    onMouseEnter={() => setShowTooltip(true)}
                                    onMouseLeave={() => setShowTooltip(false)}
                                    className="p-0.5 rounded-full hover:bg-white/10 transition-colors"
                                >
                                    <Info className="w-3.5 h-3.5 text-muted-foreground" />
                                </button>
                                {showTooltip && (
                                    <div className="absolute left-0 top-6 z-50 w-64 p-3 rounded-lg bg-popover border border-border shadow-xl text-xs text-popover-foreground">
                                        {description}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <motion.p
                        key={String(value)}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-3xl font-bold mt-1 tracking-tight"
                    >
                        {value}
                    </motion.p>
                    {subtitle && (
                        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
                    )}
                </div>
                {Icon && (
                    <div className={`p-3 rounded-xl bg-background/30 ${iconColorMap[color]}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                )}
            </div>
            {trend && trendValue && (
                <div className="mt-3 flex items-center gap-1.5">
                    <span className={`text-xs font-medium ${trend === "up" ? "text-emerald-400" :
                            trend === "down" ? "text-red-400" : "text-muted-foreground"
                        }`}>
                        {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
                    </span>
                </div>
            )}
        </motion.div>
    );
}

// Predefined metric descriptions
export const METRIC_DESCRIPTIONS = {
    healthIndex: "Composite score (0-100) measuring overall Aadhaar ecosystem health. Combines: Enrollment Volume (40%) + How recently biometrics were updated (30%) + Update activity rate (30%). Higher score means better coverage and maintenance.",
    exclusionRisk: "Risk score (0-100) indicating likelihood of residents being excluded from Aadhaar-linked services. Combines: Enrollment gaps (40%) + Outdated demographic data (35%) + Areas with no recent updates (25%). Higher score = higher risk.",
    biometricFreshness: "Average number of days since the last biometric update in this area. Lower numbers mean more recent updates. Biometric updates include fingerprint and iris re-captures.",
    demographicStaleness: "Percentage of pincodes where demographic data (name, address, DOB) hasn't been updated in over 24 months. High staleness may indicate outdated records.",
    enrollmentDeficit: "Gap between expected population and actual Aadhaar enrollments. Shows areas where enrollment coverage may be incomplete.",
    ageCohortImbalance: "Difference between child (0-5) and adult (18+) enrollment percentages. Large imbalance may indicate age-specific enrollment gaps.",
    updateDependency: "Ratio of total updates (biometric + demographic) to total enrollments. Shows maintenance burden per enrollment.",
    monsoonSpike: "Ratio of Jul-Aug biometric updates to annual average. Values >1 indicate monsoon-period surge (possibly due to fingerprint quality issues in humidity).",
    phantomChildren: "Children (0-5) enrolled but never received biometric updates. May indicate incomplete registrations or data quality issues.",
    ghostTowns: "Pincodes with enrolled population but no biometric or demographic activity for 2+ years. May indicate defunct enrollment centers.",
};
