import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertCircle, DollarSign, Bug, Edit, Eye, Trash2, CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";

export const AlertsManagement = () => {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      title: "Performance Degradation Alert",
      icon: AlertCircle,
      trigger: "Pass rate drops > 5% from baseline",
      scope: "All agents",
      channels: ["Email", "In-app", "Slack"],
      status: "active",
      recentTriggers: 2,
      color: "text-amber-500"
    },
    {
      id: 2,
      title: "Budget Threshold Alert",
      icon: DollarSign,
      trigger: "Monthly spend exceeds $1,000",
      current: "$847.23 (84.7% of threshold)",
      channels: ["Email", "In-app"],
      status: "active",
      color: "text-business-primary"
    },
    {
      id: 3,
      title: "Error Rate Spike Alert",
      icon: Bug,
      trigger: "Error rate > 5% in any 10-minute window",
      scope: "Critical agents only",
      channels: ["SMS", "In-app", "PagerDuty"],
      status: "active",
      recentTriggers: 0,
      color: "text-destructive"
    }
  ]);

  const [webhooks, setWebhooks] = useState([
    {
      id: 1,
      name: "Slack Notifications",
      endpoint: "https://hooks.slack.com/services/T...",
      events: ["eval.run.succeeded", "eval.run.failed", "eval.run.canceled", "alert.triggered"],
      lastDelivery: "2 minutes ago",
      status: "success",
      successRate: "99.8%",
      deliveries: "2,847/2,852"
    },
    {
      id: 2,
      name: "Custom CI/CD Pipeline",
      endpoint: "https://api.mycompany.com/webhook/evals",
      events: ["eval.run.succeeded", "regression.detected"],
      lastDelivery: "4 hours ago",
      status: "success",
      successRate: "100%",
      deliveries: "156/156"
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Alert Rules Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Alert Rules</h2>
            <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
              Configure when and how to be notified
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create New Alert
            </Button>
            <Button variant="outline">Import from Template</Button>
          </div>
        </div>

        <div className="mb-4">
          <Badge variant="outline" className="text-sm">
            Active Rules: {alerts.length}
          </Badge>
        </div>

        <div className="space-y-4">
          {alerts.map((alert, idx) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <Card className="glass-card p-6 hover-scale hover:shadow-card-glow transition-all">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <alert.icon className={`w-6 h-6 ${alert.color} mt-1`} />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-[hsl(var(--text-primary))] mb-2">{alert.title}</h3>
                         <div className="space-y-1 text-sm text-[hsl(var(--text-secondary))]">
                          <p><span className="font-medium">Trigger:</span> {alert.trigger}</p>
                          {alert.scope && <p><span className="font-medium">Scope:</span> {alert.scope}</p>}
                          {alert.current && <p><span className="font-medium">Current:</span> {alert.current}</p>}
                          <p><span className="font-medium">Channels:</span> {alert.channels.join(", ")}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      <span className="text-sm font-medium text-success">Active</span>
                    </div>
                  </div>

                  {/* Footer */}
                  {alert.recentTriggers !== undefined && (
                    <div className="pt-4 border-t border-border/30">
                      <p className="text-sm text-[hsl(var(--text-secondary))] mb-3">
                        Recent Triggers: {alert.recentTriggers} in past {alert.recentTriggers === 0 ? "30 days" : "7 days"}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="gap-1">
                      <Edit className="w-3 h-3" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1">
                      Disable
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Eye className="w-3 h-3" />
                      View History
                    </Button>
                    {alert.current && (
                      <Button size="sm" variant="outline" className="gap-1">
                        Adjust Threshold
                      </Button>
                    )}
                    {alert.recentTriggers === 0 && (
                      <Button size="sm" variant="outline" className="gap-1">
                        Test Alert
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Webhook Integrations Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Webhook Integrations</h2>
            <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
              Receive real-time updates via HTTP callbacks
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Webhook
            </Button>
            <Button variant="outline">Import Configuration</Button>
          </div>
        </div>

        <div className="mb-4">
          <Badge variant="outline" className="text-sm">
            Configured Webhooks: {webhooks.length}
          </Badge>
        </div>

        <div className="space-y-4">
          {webhooks.map((webhook, idx) => (
            <motion.div
              key={webhook.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <Card className="glass-card p-6 hover-scale hover:shadow-card-glow transition-all">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[hsl(var(--text-primary))] mb-2 flex items-center gap-2">
                        🔗 {webhook.name}
                      </h3>
                      <p className="text-sm text-[hsl(var(--text-secondary))] font-mono mb-3">{webhook.endpoint}</p>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-[hsl(var(--text-primary))]">Events:</p>
                        <div className="flex flex-wrap gap-2">
                          {webhook.events.map((event, eidx) => (
                            <Badge key={eidx} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="pt-4 border-t border-border/30 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[hsl(var(--text-secondary))] flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Last Delivery:
                      </span>
                      <span className="flex items-center gap-2 text-[hsl(var(--text-primary))]">
                        {webhook.lastDelivery}
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        Success
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[hsl(var(--text-secondary))]">Success Rate:</span>
                      <span className="font-medium text-[hsl(var(--text-primary))]">{webhook.successRate} ({webhook.deliveries} delivered)</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="gap-1">
                      <Edit className="w-3 h-3" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      Test Webhook
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Eye className="w-3 h-3" />
                      View Logs
                    </Button>
                    <Button size="sm" variant="outline">
                      Disable
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
