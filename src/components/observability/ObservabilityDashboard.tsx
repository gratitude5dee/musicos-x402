import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, FlaskConical, DollarSign, Zap, CheckCircle2, TrendingUp, TrendingDown, ArrowUpRight, Pause, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

export const ObservabilityDashboard = () => {
  const metrics = [
    {
      icon: Bot,
      label: "Agents",
      value: "24",
      subtitle: "Active",
      change: "+12%",
      trend: "up" as const,
      color: "text-studio-accent"
    },
    {
      icon: FlaskConical,
      label: "Evals",
      value: "156",
      subtitle: "Running",
      change: "+8 new",
      trend: "up" as const,
      color: "text-creative-primary"
    },
    {
      icon: DollarSign,
      label: "Cost",
      value: "$847.23",
      subtitle: "Today",
      change: "↓ 5%",
      trend: "down" as const,
      color: "text-business-primary"
    },
    {
      icon: Zap,
      label: "Latency",
      value: "245ms",
      subtitle: "p95",
      change: "↓ 18ms",
      trend: "down" as const,
      color: "text-technical-primary"
    },
    {
      icon: CheckCircle2,
      label: "QA",
      value: "97.3%",
      subtitle: "Pass",
      change: "↑ 2%",
      trend: "up" as const,
      color: "text-success"
    }
  ];

  const activities = [
    { time: "Now", event: "Booking Agent completed eval run #145", status: "success", detail: "✓ 98% pass rate | 47/48 tests passed" },
    { time: "2s", event: "Invoice Generator started eval #146", status: "pending", detail: "⏳ Running 50 test cases..." },
    { time: "15s", event: "Social Media Agent threshold alert", status: "warning", detail: "⚠️ Response time: 1.2s (threshold: 1.0s)" },
    { time: "1m", event: "Content Manager eval failed", status: "error", detail: "❌ 3/50 tests failed - Click for details" },
    { time: "2m", event: "System backup completed", status: "success", detail: "✓ 847 MB backed up to sanctuary" }
  ];

  const agents = [
    { name: "Booking Agent", status: 4, evals: "12/15", passRate: "98.5%", latency: "245ms", cost: "$12.45" },
    { name: "Invoice Gen", status: 5, evals: "8/8", passRate: "100%", latency: "180ms", cost: "$8.20" },
    { name: "Social Media", status: 3, evals: "15/20", passRate: "91.2%", latency: "890ms", cost: "$24.10" },
    { name: "Content Mgr", status: 2, evals: "3/10", passRate: "85.0%", latency: "1.2s", cost: "$18.55" },
    { name: "Payment Track", status: 5, evals: "5/5", passRate: "100%", latency: "95ms", cost: "$4.30" },
    { name: "Design Studio", status: 4, evals: "10/12", passRate: "95.8%", latency: "350ms", cost: "$15.75" }
  ];

  return (
    <div className="space-y-6">
      {/* Hero Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {metrics.map((metric, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
          >
            <Card className="glass-card p-6 hover-scale hover:shadow-card-glow transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <metric.icon className={`w-8 h-8 ${metric.color}`} />
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  metric.trend === "up" 
                    ? "bg-success/10 text-success" 
                    : "bg-muted/50 text-[hsl(var(--text-secondary))]"
                }`}>
                  {metric.change}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-[hsl(var(--text-primary))]">{metric.value}</p>
                <p className="text-sm text-[hsl(var(--text-secondary))]">{metric.subtitle}</p>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">{metric.label}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Live Activity Stream */}
      <Card className="glass-card overflow-hidden">
        <div className="p-6 border-b border-border/50 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[hsl(var(--text-primary))]">Live Activity Stream</h3>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">
              <Pause className="w-3 h-3 mr-1" />
              Pause
            </Button>
            <Button size="sm" variant="ghost">
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="divide-y divide-border/30">
          {activities.map((activity, idx) => (
            <div key={idx} className="p-4 hover:bg-accent/5 transition-colors cursor-pointer group">
              <div className="flex items-start gap-4">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.status === "success" ? "bg-success" :
                  activity.status === "error" ? "bg-destructive" :
                  activity.status === "warning" ? "bg-amber-500" :
                  "bg-blue-500 animate-pulse"
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-[hsl(var(--text-tertiary))]">{activity.time}</span>
                    <span className="text-sm font-medium text-[hsl(var(--text-primary))]">{activity.event}</span>
                  </div>
                  <p className="text-sm text-[hsl(var(--text-secondary))]">{activity.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-[hsl(var(--text-primary))] mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { icon: FlaskConical, label: "New Eval", action: "Create" },
            { icon: ArrowUpRight, label: "Run Test", action: "Run" },
            { icon: TrendingUp, label: "View Report", action: "Open" },
            { icon: Bot, label: "Clusters", action: "Explore" },
            { icon: CheckCircle2, label: "Alerts", action: "Configure" },
            { icon: Zap, label: "Health", action: "Monitor" }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <Card className="glass-card p-4 hover-scale hover:shadow-card-glow transition-all duration-300 cursor-pointer group">
                <item.icon className="w-6 h-6 text-[hsl(var(--accent-purple))] mb-3 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-sm mb-1 text-[hsl(var(--text-primary))]">{item.label}</p>
                <p className="text-xs text-[hsl(var(--text-secondary))]">{item.action}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Agent Performance Matrix */}
      <Card className="glass-card overflow-hidden">
        <div className="p-6 border-b border-border/50 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[hsl(var(--text-primary))]">Agent Performance Matrix</h3>
          <Button size="sm" variant="outline">Sort <ChevronDown className="w-3 h-3 ml-1" /></Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border/30">
              <tr className="text-left text-xs text-[hsl(var(--text-secondary))]">
                <th className="p-4 font-medium">Agent Name</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Evals</th>
                <th className="p-4 font-medium">Pass Rate</th>
                <th className="p-4 font-medium">Latency</th>
                <th className="p-4 font-medium">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {agents.map((agent, idx) => (
                <tr key={idx} className="hover:bg-accent/5 transition-colors">
                  <td className="p-4 font-medium text-[hsl(var(--text-primary))]">{agent.name}</td>
                  <td className="p-4">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-2 h-2 rounded-full ${
                            i < agent.status ? "bg-success" : "bg-muted"
                          }`} 
                        />
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-[hsl(var(--text-secondary))]">{agent.evals}</td>
                  <td className="p-4 text-sm text-[hsl(var(--text-secondary))]">{agent.passRate}</td>
                  <td className="p-4 text-sm text-[hsl(var(--text-secondary))]">{agent.latency}</td>
                  <td className="p-4 text-sm text-[hsl(var(--text-secondary))]">{agent.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
          <span>Legend: ●●●●● Excellent | ●●●●○ Good | ●●●○○ Fair | ●●○○○ Poor | ●○○○○ Critical</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">View All Agents</Button>
            <Button size="sm" variant="outline">Export CSV</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
