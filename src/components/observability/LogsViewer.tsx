import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Pause, Play, RefreshCw, AlertCircle, Info, Bug, AlertTriangle, FileText, Eye, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

export const LogsViewer = () => {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTest, setSelectedTest] = useState<number | null>(null);

  const logs = [
    { time: "14:32:15", level: "INFO", source: "EvalEngine", message: "Run #156 started", color: "text-blue-500" },
    { time: "14:32:16", level: "DEBUG", source: "TestRunner", message: "Loading dataset...", color: "text-muted-foreground" },
    { time: "14:32:17", level: "INFO", source: "TestRunner", message: "Processing 100 tests", color: "text-blue-500" },
    { time: "14:32:18", level: "WARN", source: "TokenCounter", message: "High token usage", color: "text-amber-500" },
    { time: "14:33:45", level: "INFO", source: "GradingEngine", message: "Test #47 passed", color: "text-blue-500" },
    { time: "14:33:46", level: "ERROR", source: "GradingEngine", message: "Test #48 failed", color: "text-destructive" },
    { time: "14:33:46", level: "DEBUG", source: "ErrorHandler", message: "Reason: Mismatch", color: "text-muted-foreground" },
    { time: "14:34:01", level: "INFO", source: "EvalEngine", message: "Run #156 completed", color: "text-blue-500" },
    { time: "14:34:02", level: "INFO", source: "NotificationSvc", message: "Webhook sent", color: "text-blue-500" },
    { time: "14:34:03", level: "INFO", source: "StorageEngine", message: "Results saved", color: "text-blue-500" }
  ];

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "ERROR": return <AlertCircle className="w-4 h-4" />;
      case "WARN": return <AlertTriangle className="w-4 h-4" />;
      case "DEBUG": return <Bug className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* System Logs Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[hsl(var(--text-primary))]">System Logs</h2>
            <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
              Real-time and historical system activity
            </p>
          </div>
        </div>

        <Card className="glass-card overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-border/50 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search logs..." className="pl-10" />
              </div>
              <Button variant="outline" size="sm">All Levels ▼</Button>
              <Button variant="outline" size="sm">All Sources ▼</Button>
              <Button variant="outline" size="sm">Last Hour ▼</Button>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? (
                  <>
                    <Pause className="w-3 h-3" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3" />
                    Resume
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-3 h-3" />
                Download CSV
              </Button>
            </div>
          </div>

          {/* Log Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border/30 bg-accent/5">
                <tr className="text-left text-xs text-[hsl(var(--text-secondary))]">
                  <th className="p-3 font-medium">Time</th>
                  <th className="p-3 font-medium">Level</th>
                  <th className="p-3 font-medium">Source</th>
                  <th className="p-3 font-medium">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {logs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-accent/5 transition-colors">
                    <td className="p-3 text-xs font-mono">{log.time}</td>
                    <td className="p-3">
                      <Badge variant="outline" className={`${log.color} border-current/30 bg-current/10 gap-1`}>
                        {getLevelIcon(log.level)}
                        {log.level}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm font-medium text-[hsl(var(--text-primary))]">{log.source}</td>
                    <td className="p-3 text-sm text-[hsl(var(--text-secondary))]">{log.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? "bg-success animate-pulse" : "bg-muted"}`} />
              <span className="text-xs text-[hsl(var(--text-secondary))]">
                {autoRefresh ? "Auto-refresh enabled" : "Auto-refresh paused"}
              </span>
            </div>
            <Button variant="outline" size="sm">Export Logs</Button>
          </div>
        </Card>
      </div>

      {/* Test Case Debugger */}
      <Card className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[hsl(var(--text-primary))]">Test Case Debugger</h2>
            <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
              Deep dive into individual test executions
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Eye className="w-4 h-4" />
            View Test #77
          </Button>
        </div>

        <div className="space-y-6">
          {/* Test Info */}
          <div>
            <p className="text-sm font-medium mb-2">Run #156 → Test #77 (FAILED)</p>
          </div>

          {/* Input Data */}
          <div>
            <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mb-2">Input Data:</p>
            <Card className="bg-accent/5 p-4 border-border/30">
              <pre className="text-xs font-mono text-[hsl(var(--text-secondary))]">
{`{
  "ticket_text": "Excel formula not calculating",
  "correct_label": "Software",
  "priority": "Medium"
}`}
              </pre>
            </Card>
          </div>

          {/* Prompt */}
          <div>
            <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mb-2">Prompt Sent:</p>
            <Card className="bg-accent/5 p-4 border-border/30">
              <div className="space-y-3">
                <div>
                  <Badge variant="outline" className="text-xs mb-2">Developer Message</Badge>
                  <p className="text-xs text-[hsl(var(--text-secondary))]">You are an expert in categorizing IT support...</p>
                </div>
                <div>
                  <Badge variant="outline" className="text-xs mb-2">User Message</Badge>
                  <p className="text-xs text-[hsl(var(--text-secondary))]">Excel formula not calculating</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Response */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mb-2">Model Response:</p>
              <Card className="bg-accent/5 p-4 border-border/30">
                <p className="text-sm text-[hsl(var(--text-secondary))]">Other</p>
              </Card>
            </div>
            <div>
              <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mb-2">Expected Output:</p>
              <Card className="bg-accent/5 p-4 border-border/30">
                <p className="text-sm text-[hsl(var(--text-secondary))]">Software</p>
              </Card>
            </div>
          </div>

          {/* Grading Result */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">Grading Result: <span className="text-destructive">FAILED</span></p>
            </div>
            <p className="text-sm text-[hsl(var(--text-secondary))]">Reason: String mismatch ("Other" != "Software")</p>
          </div>

          {/* Metadata */}
          <div>
            <p className="text-sm font-semibold text-[hsl(var(--text-primary))] mb-2">Metadata:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">Latency</p>
                <p className="text-sm font-medium text-[hsl(var(--text-primary))]">189ms</p>
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">Tokens</p>
                <p className="text-sm font-medium text-[hsl(var(--text-primary))]">86 (84 + 2)</p>
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">Cost</p>
                <p className="text-sm font-medium text-[hsl(var(--text-primary))]">$0.0011</p>
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--text-tertiary))]">Model</p>
                <p className="text-sm font-medium text-[hsl(var(--text-primary))]">gpt-4o-mini</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-border/30">
            <Button size="sm" variant="outline" className="gap-1">
              <RotateCcw className="w-3 h-3" />
              Retry with Different Prompt
            </Button>
            <Button size="sm" variant="outline">
              Mark as Expected
            </Button>
            <Button size="sm" variant="outline">
              Add to Training Data
            </Button>
            <Button size="sm" variant="outline">
              Regenerate Response
            </Button>
            <Button size="sm" variant="outline" className="gap-1">
              <FileText className="w-3 h-3" />
              View Full JSON
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
