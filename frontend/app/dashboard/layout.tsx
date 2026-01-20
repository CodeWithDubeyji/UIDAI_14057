"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    LayoutDashboard, BarChart3, Globe2, AlertTriangle, GitCompare, Info,
    ChevronLeft, ChevronRight, Filter, TrendingUp, Users, RefreshCw
} from "lucide-react";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/indices", label: "Indices", icon: BarChart3 },
    { href: "/clusters", label: "Clusters", icon: Globe2 },
    { href: "/anomalies", label: "Anomalies", icon: AlertTriangle },
    { href: "/compare", label: "Compare", icon: GitCompare },
    { href: "/about", label: "About", icon: Info },
    { href: "/trends", label: "Trends", icon: TrendingUp },
];

const metrics = [
    "Enrollment Coverage", "Age Cohort Imbalance", "Biometric Freshness",
    "Demographic Staleness", "Exclusion Risk", "Health Index"
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState(metrics[0]);

    return (
        <div className="min-h-screen flex">
            {/* Left Sidebar */}
            <aside className={`fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border z-40 transition-all duration-300 ${sidebarCollapsed ? "w-16" : "w-64"}`}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
                    {!sidebarCollapsed && (
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg gradient-teal flex items-center justify-center">
                                <Globe2 className="w-5 h-5 text-background" />
                            </div>
                            <span className="font-bold text-sm gradient-text">Insight Atlas</span>
                        </Link>
                    )}
                    <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 rounded-lg hover:bg-sidebar-accent">
                        {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-3 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? "bg-primary/20 text-primary" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                                    }`}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                {!sidebarCollapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Filters Section */}
                {!sidebarCollapsed && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                            <Filter className="w-4 h-4" />
                            <span className="font-medium">FILTERS</span>
                        </div>

                        {/* Metric Selector */}
                        <div className="mb-3">
                            <label className="text-xs text-muted-foreground mb-1 block">Metric</label>
                            <select
                                value={selectedMetric}
                                onChange={(e) => setSelectedMetric(e.target.value)}
                                className="w-full bg-sidebar-accent border border-sidebar-border rounded-lg px-3 py-2 text-sm"
                            >
                                {metrics.map((m) => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>

                        {/* Toggle Buttons */}
                        <div className="flex gap-2 mb-3">
                            <button className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-primary/20 text-primary border border-primary/30">
                                Enrollment
                            </button>
                            <button className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-sidebar-accent text-muted-foreground">
                                Updates
                            </button>
                        </div>

                        <button className="w-full px-3 py-2 text-xs rounded-lg bg-sidebar-accent text-muted-foreground hover:text-foreground flex items-center justify-center gap-2">
                            <RefreshCw className="w-3 h-3" />
                            Reset View
                        </button>
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-16" : "ml-64"}`}>
                <div className="min-h-screen p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
