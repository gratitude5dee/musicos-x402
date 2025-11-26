import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useVaultStore } from '@/stores/vaultStore';
import { Shield, FileText, Scale, Lock, TrendingUp, Clock } from 'lucide-react';
import { formatBytes } from '@/lib/utils';
import { motion } from 'framer-motion';

export function VaultDashboard() {
  const { stats } = useVaultStore();

  const typeIcons: Record<string, React.ReactNode> = {
    copyright: <FileText className="h-4 w-4" />,
    trademark: <Shield className="h-4 w-4" />,
    patent: <Scale className="h-4 w-4" />,
    trade_secret: <Lock className="h-4 w-4" />,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Total Assets', value: stats.totalAssets, icon: FileText, subtitle: 'Registered IP assets' },
          { title: 'Storage Used', value: formatBytes(stats.totalSize), icon: TrendingUp, subtitle: 'Across all assets' },
          { title: 'Copyrights', value: stats.assetsByType.copyright || 0, icon: FileText, subtitle: 'Protected works' },
          { title: 'Trademarks', value: stats.assetsByType.trademark || 0, icon: Shield, subtitle: 'Registered marks' }
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
          >
            <Card className="glass-card border border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[hsl(var(--text-primary))]">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[hsl(var(--text-primary))]">{stat.value}</div>
                <p className="text-xs text-[hsl(var(--text-secondary))]">
                  {stat.subtitle}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Asset Types Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card className="glass-card border border-border/50">
          <CardHeader>
            <CardTitle className="text-[hsl(var(--text-primary))]">Assets by Type</CardTitle>
            <CardDescription className="text-[hsl(var(--text-secondary))]">Distribution of your IP assets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.assetsByType).map(([type, count]) => (
                <div key={type} className="flex items-center">
                  <div className="flex items-center gap-2 flex-1">
                    {typeIcons[type]}
                    <span className="text-sm font-medium capitalize text-[hsl(var(--text-primary))]">
                      {type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-[200px] bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${(count / stats.totalAssets) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-[hsl(var(--text-secondary))] w-12 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <Card className="glass-card border border-border/50">
          <CardHeader>
            <CardTitle className="text-[hsl(var(--text-primary))]">Recent Activity</CardTitle>
            <CardDescription className="text-[hsl(var(--text-secondary))]">Latest updates to your vault</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-[hsl(var(--text-primary))]">{activity.assetName}</p>
                    <p className="text-xs text-[hsl(var(--text-secondary))]">{activity.details}</p>
                    <p className="text-xs text-[hsl(var(--text-secondary))]">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
