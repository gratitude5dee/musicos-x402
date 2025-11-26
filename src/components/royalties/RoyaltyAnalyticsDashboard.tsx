import React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, DollarSign, Percent, Clock } from 'lucide-react';
import { RoyaltyHistoryEntry } from '@/types/royalty';

interface RoyaltyAnalyticsDashboardProps {
  history: RoyaltyHistoryEntry[];
  timeRange: 'day' | 'week' | 'month' | 'year' | 'all';
}

export function RoyaltyAnalyticsDashboard({ history, timeRange }: RoyaltyAnalyticsDashboardProps) {
  // Mock data for charts
  const earningsOverTime = [
    { date: 'Jan', earnings: 4000 },
    { date: 'Feb', earnings: 3000 },
    { date: 'Mar', earnings: 5000 },
    { date: 'Apr', earnings: 4500 },
    { date: 'May', earnings: 6000 },
    { date: 'Jun', earnings: 5500 },
  ];

  const earningsByAsset = [
    { name: 'Root IP', value: 45 },
    { name: 'Derivative A', value: 30 },
    { name: 'Derivative B', value: 15 },
    { name: 'Sub-derivative', value: 10 },
  ];

  const COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--accent-blue))',
    'hsl(var(--accent-green))',
    'hsl(var(--accent-purple))',
  ];

  const stats = [
    {
      label: 'Total Earned',
      value: '$12,450.00',
      icon: DollarSign,
      trend: '+12.5%',
      color: 'text-accent-green',
    },
    {
      label: 'Pending Claims',
      value: '$3,250.00',
      icon: Clock,
      trend: '5 assets',
      color: 'text-accent-blue',
    },
    {
      label: 'Avg. Royalty Rate',
      value: '8.5%',
      icon: Percent,
      trend: 'Across all IPs',
      color: 'text-accent-purple',
    },
    {
      label: 'Growth',
      value: '+24.3%',
      icon: TrendingUp,
      trend: 'vs last month',
      color: 'text-primary',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="p-4 glass-card border border-border/50">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-text-secondary mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                <p className={`text-xs ${stat.color} mt-1`}>{stat.trend}</p>
              </div>
              <div className={`p-2 rounded-lg bg-background/50 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <Tabs defaultValue="earnings" className="w-full">
        <TabsList className="glass-card">
          <TabsTrigger value="earnings">Earnings Over Time</TabsTrigger>
          <TabsTrigger value="assets">By Asset</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="earnings" className="mt-4">
          <Card className="p-6 glass-card border border-border/50">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Earnings Trend
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={earningsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--text-secondary))" />
                <YAxis stroke="hsl(var(--text-secondary))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="earnings"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="assets" className="mt-4">
          <Card className="p-6 glass-card border border-border/50">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Earnings by IP Asset
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={earningsByAsset}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {earningsByAsset.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-3">
                {earningsByAsset.map((asset, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index] }}
                      />
                      <span className="text-sm text-text-primary">{asset.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-text-primary">
                      {asset.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card className="p-6 glass-card border border-border/50">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              {history.slice(0, 10).map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        entry.type === 'claimed'
                          ? 'bg-accent-green'
                          : entry.type === 'distributed'
                          ? 'bg-accent-blue'
                          : 'bg-accent-purple'
                      }`}
                    />
                    <div>
                      <div className="text-sm text-text-primary capitalize">
                        {entry.type}
                      </div>
                      <div className="text-xs text-text-secondary">
                        {entry.timestamp.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-text-primary">
                      {(Number(entry.amount) / 1e18).toFixed(4)} ETH
                    </div>
                    <a
                      href={`https://etherscan.io/tx/${entry.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      View tx
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
