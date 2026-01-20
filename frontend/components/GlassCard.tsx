"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    padding?: "sm" | "md" | "lg";
}

const paddingMap = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
};

export function GlassCard({
    children,
    className = "",
    hover = false,
    padding = "md"
}: GlassCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-card ${paddingMap[padding]} ${hover ? "glass-card-hover cursor-pointer" : ""} ${className}`}
        >
            {children}
        </motion.div>
    );
}

export function SectionTitle({
    children,
    subtitle
}: {
    children: ReactNode;
    subtitle?: string;
}) {
    return (
        <div className="mb-6">
            <h2 className="text-xl font-bold">{children}</h2>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
    );
}
