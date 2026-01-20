"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Globe2, BarChart3, Shield, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1000 600">
          <motion.path
            d="M500,100 C600,150 700,200 650,300 C600,400 550,450 500,500 C450,450 400,400 350,300 C300,200 400,150 500,100"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-primary"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.5 }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />
        </svg>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          {/* Logo Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-8"
          >
            <Globe2 className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">Aadhaar Insight Atlas</span>
          </motion.div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            <span className="gradient-text">Visualizing Aadhaar</span>
            <br />
            <span className="text-foreground">Coverage & Update Health</span>
            <br />
            <span className="text-muted-foreground text-3xl md:text-4xl lg:text-5xl">Across India</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Interactive geospatial analytics platform for exploring enrollment patterns,
            biometric updates, and demographic trends at national, state, district, and pincode levels.
          </p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl gradient-teal text-background font-semibold text-lg hover:shadow-lg hover:shadow-primary/30 transition-all"
            >
              Enter Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-5xl w-full px-4"
        >
          {[
            { icon: Globe2, title: "Geospatial Analytics", desc: "Interactive drill-down from national to pincode level" },
            { icon: BarChart3, title: "41 Endpoints", desc: "32 metrics + 9 ML-powered trend analysis endpoints" },
            { icon: Shield, title: "Fraud Detection", desc: "ML-based anomaly detection and predictive forecasting" },
          ].map((feature, i) => (
            <div
              key={feature.title}
              className="glass-card p-6 text-left"
            >
              <feature.icon className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
