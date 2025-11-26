import { Card } from '@/components/ui/card';
import { GitBranch, Clock, CheckCircle2, DollarSign, Percent } from 'lucide-react';
import type { DerivativeStats } from '@/types/derivative';

interface DerivativeStatsProps {
  stats: DerivativeStats;
}

export function DerivativeStats({ stats }: DerivativeStatsProps) {
  const statItems = [
    {
      label: 'Total Derivatives',
      value: stats.totalDerivatives,
      icon: GitBranch,
      color: 'text-blue-500',
    },
    {
      label: 'Pending Approvals',
      value: stats.pendingApprovals,
      icon: Clock,
      color: 'text-yellow-500',
    },
    {
      label: 'Active Derivatives',
      value: stats.activeDerivatives,
      icon: CheckCircle2,
      color: 'text-green-500',
    },
    {
      label: 'Total Royalties Earned',
      value: `$${stats.totalRoyaltiesEarned}`,
      icon: DollarSign,
      color: 'text-purple-500',
    },
    {
      label: 'Avg Royalty Share',
      value: `${stats.averageRoyaltyShare}%`,
      icon: Percent,
      color: 'text-indigo-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {statItems.map((item) => (
        <Card key={item.label} className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-2xl font-bold mt-1">{item.value}</p>
            </div>
            <item.icon className={`h-5 w-5 ${item.color}`} />
          </div>
        </Card>
      ))}
    </div>
  );
}
