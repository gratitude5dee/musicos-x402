import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Clock, AlertTriangle, CheckCircle2, ChevronDown, Sparkles } from "lucide-react";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { motion } from "framer-motion";

export const AdvancedAnalytics = () => {
  return (
    <div className="space-y-6">
      {/* Performance Trends */}
      <Card className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[hsl(var(--text-primary))]">Performance Trends</h3>
          <Button variant="outline" size="sm">7 Days ▼</Button>
        </div>
        
        <div className="space-y-8">
          {/* Pass Rate Chart */}
          <div>
            <h4 className="text-sm font-medium text-[hsl(var(--text-primary))] mb-4">Pass Rate Over Time</h4>
            <div className="h-48 rounded-lg bg-gradient-to-br from-accent/5 to-accent/10 border border-border/50 flex items-center justify-center">
              <p className="text-sm text-[hsl(var(--text-secondary))]">Chart: Pass rate trending ↗ +3.2% this week</p>
            </div>
          </div>

          {/* Latency Chart */}
          <div>
            <h4 className="text-sm font-medium text-[hsl(var(--text-primary))] mb-4">Latency Distribution (p50, p95, p99)</h4>
            <div className="h-48 rounded-lg bg-gradient-to-br from-accent/5 to-accent/10 border border-border/50 flex items-center justify-center">
              <p className="text-sm text-[hsl(var(--text-secondary))]">Chart: p50: 205ms | p95: 289ms | p99: 412ms</p>
            </div>
          </div>

          {/* Cost Chart */}
          <div>
            <h4 className="text-sm font-medium text-[hsl(var(--text-primary))] mb-4">Cost Per Eval Run</h4>
            <div className="h-48 rounded-lg bg-gradient-to-br from-accent/5 to-accent/10 border border-border/50 flex items-center justify-center">
              <p className="text-sm text-[hsl(var(--text-secondary))]">Chart: Total This Week: $4.23 | Avg per Run: $0.12</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Cost Optimization */}
      <Card className="glass-card p-6">
        <h3 className="text-lg font-semibold text-[hsl(var(--text-primary))] mb-4">💰 Cost Optimization</h3>
        
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-[hsl(var(--text-primary))] mb-2">This Month: $847.23</p>
            <div className="space-y-2">
              {[
                { name: "Social Media Agent", amount: "$245.80", percent: 29 },
                { name: "Booking Agent", amount: "$198.45", percent: 23 },
                { name: "Content Manager", amount: "$176.20", percent: 21 }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-sm text-[hsl(var(--text-secondary))] w-40">{item.name}</span>
                  <div className="flex-1 bg-accent/20 rounded-full h-2">
                    <div 
                      className="bg-business-primary h-full rounded-full transition-all" 
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-[hsl(var(--text-primary))] w-20 text-right">{item.amount}</span>
                  <span className="text-xs text-[hsl(var(--text-tertiary))] w-12">({item.percent}%)</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-border/30">
            <h4 className="text-sm font-semibold text-[hsl(var(--text-primary))] mb-3">💡 Optimization Recommendations</h4>
            <div className="space-y-3">
              {[
                {
                  title: "Switch Social Media Agent to gpt-4o-mini",
                  savings: "$147/month (60%)",
                  impact: "<2% quality degradation expected"
                },
                {
                  title: "Enable prompt caching for Booking Agent",
                  savings: "$45/month (23%)",
                  impact: "No quality change, 15% latency improvement"
                }
              ].map((rec, idx) => (
                <Card key={idx} className="p-4 bg-accent/5 border-border/30">
                  <p className="text-sm font-medium text-[hsl(var(--text-primary))] mb-1">{rec.title}</p>
                  <p className="text-xs text-success mb-1">Potential savings: {rec.savings}</p>
                  <p className="text-xs text-[hsl(var(--text-secondary))] mb-3">Impact: {rec.impact}</p>
                  <div className="flex gap-2">
                    <Button size="sm">Apply Recommendation</Button>
                    <Button size="sm" variant="outline">Test First</Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Regression Detection */}
      <Card className="glass-card p-6">
        <h3 className="text-lg font-semibold text-[hsl(var(--text-primary))] mb-4">🔍 Regression Detection</h3>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm font-medium text-success">Status: All Systems Normal</span>
        </div>
        
        <div className="space-y-3">
          {[
            { agent: "Booking Agent", status: "success", passRate: "98.5%", baseline: "97.8% ± 2%" },
            { agent: "Social Media Agent", status: "warning", passRate: "88.2%", baseline: "91.2% ± 2%", degradation: "-3.0%" },
            { agent: "Invoice Generator", status: "success", passRate: "100%", baseline: "99.1% ± 1%", improvement: "+0.9%" }
          ].map((item, idx) => (
            <Card key={idx} className={`p-4 border ${
              item.status === "success" 
                ? "border-success/20 bg-success/5" 
                : "border-amber-500/20 bg-amber-500/5"
            }`}>
              <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-[hsl(var(--text-primary))] mb-1">{item.agent}</p>
                <p className="text-xs text-[hsl(var(--text-secondary))] mb-1">
                    Pass rate: {item.passRate} (baseline: {item.baseline})
                  </p>
                  {item.degradation && (
                    <p className="text-xs text-amber-500">⚠️ Degradation: {item.degradation}</p>
                  )}
                  {item.improvement && (
                    <p className="text-xs text-success">✨ Improvement: {item.improvement}</p>
                  )}
                </div>
                {item.status === "warning" && (
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline">Investigate</Button>
                    <Button size="sm" variant="ghost">Dismiss</Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};
