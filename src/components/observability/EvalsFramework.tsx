import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Upload, Play, Search, Filter, Settings, BarChart3, FileText, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";

interface EvalSuite {
  id: string;
  title: string;
  agent: string;
  tests: number;
  passRate: number;
  lastRun: string;
  status: 'passing' | 'failing' | 'warning';
  criteria: string[];
  recentRuns: Array<{
    runNumber: number;
    passed: number;
    total: number;
    timestamp: string;
  }>;
  latency: number;
  cost: number;
}

const mockEvalSuites: EvalSuite[] = [
  {
    id: "1",
    title: "IT Ticket Categorization",
    agent: "Support Classifier",
    tests: 156,
    passRate: 98.5,
    lastRun: "2h ago",
    status: "passing",
    criteria: ['String match: "{{ output }}" == "{{ label }}"', 'Confidence threshold: > 0.85'],
    recentRuns: [
      { runNumber: 145, passed: 154, total: 156, timestamp: "2h ago" },
      { runNumber: 144, passed: 153, total: 156, timestamp: "6h ago" },
      { runNumber: 143, passed: 156, total: 156, timestamp: "1d ago" },
    ],
    latency: 245,
    cost: 0.12
  },
  {
    id: "2",
    title: "Creative Asset Quality",
    agent: "Design Studio",
    tests: 89,
    passRate: 95.2,
    lastRun: "4h ago",
    status: "passing",
    criteria: ['Model grader: "Is design aesthetically pleasing?"', 'Resolution check: >= 300 DPI'],
    recentRuns: [
      { runNumber: 78, passed: 85, total: 89, timestamp: "4h ago" },
      { runNumber: 77, passed: 84, total: 89, timestamp: "8h ago" },
    ],
    latency: 350,
    cost: 0.18
  },
];

export const EvalsFramework = () => {
  const [selectedEval, setSelectedEval] = useState<EvalSuite | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runProgress, setRunProgress] = useState(0);

  const handleRunEval = (evalSuite: EvalSuite) => {
    setSelectedEval(evalSuite);
    setIsRunning(true);
    setRunProgress(0);
    
    const interval = setInterval(() => {
      setRunProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passing': return 'hsl(var(--success))';
      case 'failing': return 'hsl(var(--error))';
      case 'warning': return 'hsl(var(--warning))';
      default: return 'hsl(var(--text-tertiary))';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center gap-3">
        <Button className="gap-2 bg-gradient-to-r from-studio-accent to-creative-primary hover:opacity-90">
          <Plus className="w-4 h-4" />
          Create New Eval
        </Button>
        <Button variant="outline" className="gap-2">
          <Upload className="w-4 h-4" />
          Upload Test Data
        </Button>
        <Button variant="outline" className="gap-2">
          <Play className="w-4 h-4" />
          Run Suite
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-10 w-64" />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Eval Suites */}
      <div className="space-y-4">
        {mockEvalSuites.map((suite, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
          >
            <Card className="glass-card p-6 hover-scale hover:shadow-card-glow transition-all">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[hsl(var(--text-primary))] mb-2">📋 {suite.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-[hsl(var(--text-secondary))]">
                      <span>Tests: {suite.tests}</span>
                      <span>•</span>
                      <span className={suite.passRate >= 95 ? "text-success" : "text-amber-500"}>
                        Pass Rate: {suite.passRate}%
                      </span>
                      <span>•</span>
                      <span>Last Run: {suite.lastRun}</span>
                    </div>
                    <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">Agent: {suite.agent}</p>
                  </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  suite.passRate >= 95 
                    ? "bg-success/10 text-success" 
                    : "bg-amber-500/10 text-amber-500"
                }`}>
                  {suite.passRate >= 95 ? "✓ Passing" : "⚠ Needs Attention"}
                </div>
              </div>

              {/* Criteria */}
              <div>
                <p className="text-sm font-medium text-[hsl(var(--text-primary))] mb-2">Testing Criteria:</p>
                <ul className="space-y-1">
                  {suite.criteria.map((criterion, cidx) => (
                    <li key={cidx} className="text-sm text-[hsl(var(--text-secondary))] pl-4">
                      • {criterion}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recent Activity */}
              <div>
                <p className="text-sm font-medium text-[hsl(var(--text-primary))] mb-2">Recent Activity:</p>
                <div className="space-y-1">
                  {suite.recentRuns.map((run, ridx) => (
                    <div key={ridx} className="text-sm text-[hsl(var(--text-secondary))] flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-success" />
                      <span>Run #{run.runNumber}: {run.passed} passed</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                <Button size="sm" className="gap-1">
                  <Play className="w-3 h-3" />
                  Run Now
                </Button>
                <Button size="sm" variant="outline" className="gap-1">
                  <BarChart3 className="w-3 h-3" />
                  View Report
                </Button>
                <Button size="sm" variant="outline" className="gap-1">
                  <Settings className="w-3 h-3" />
                  Configure
                </Button>
                <Button size="sm" variant="outline" className="gap-1">
                  <FileText className="w-3 h-3" />
                  Logs
                </Button>
              </div>
            </div>
          </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State Hint */}
      <Card className="glass-card p-8 text-center">
        <div className="space-y-3">
          <div className="w-16 h-16 rounded-full bg-[hsl(var(--accent-purple))]/10 flex items-center justify-center mx-auto">
            <Plus className="w-8 h-8 text-[hsl(var(--accent-purple))]" />
          </div>
          <h3 className="text-lg font-semibold text-[hsl(var(--text-primary))]">Create Your First Eval</h3>
          <p className="text-sm text-[hsl(var(--text-secondary))] max-w-md mx-auto">
            Get started by creating an evaluation suite to test and improve your AI agent outputs continuously
          </p>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Create New Eval
          </Button>
        </div>
      </Card>
    </div>
  );
};
