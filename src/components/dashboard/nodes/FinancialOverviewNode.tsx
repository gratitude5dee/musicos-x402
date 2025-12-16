import React, { memo } from 'react';
import { NodeResizer } from '@xyflow/react';
import { Users, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { PremiumStatsCard } from '../ui/PremiumStatsCard';

const FinancialOverviewNode = memo(() => {
  const stats = [
    {
      title: 'Total Fans',
      value: '45.2K',
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: Users,
      iconColor: '#06b6d4',
      iconBgColor: 'rgba(6, 182, 212, 0.15)'
    },
    {
      title: 'Revenue',
      value: '$12.4K',
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      iconColor: '#22c55e',
      iconBgColor: 'rgba(34, 197, 94, 0.15)'
    },
    {
      title: 'Royalties',
      value: '$3.8K',
      change: '+15.3%',
      changeType: 'positive' as const,
      icon: DollarSign,
      iconColor: '#a855f7',
      iconBgColor: 'rgba(168, 85, 247, 0.15)'
    },
    {
      title: 'Events',
      value: '23',
      change: '+5',
      changeType: 'positive' as const,
      icon: Calendar,
      iconColor: '#ec4899',
      iconBgColor: 'rgba(236, 72, 153, 0.15)'
    }
  ];

  return (
    <>
      <NodeResizer minWidth={700} minHeight={140} />
      <div className="grid grid-cols-4 gap-4 w-full h-full">
        {stats.map((stat, index) => (
          <PremiumStatsCard
            key={stat.title}
            {...stat}
            delay={index * 0.1}
          />
        ))}
      </div>
    </>
  );
});

FinancialOverviewNode.displayName = 'FinancialOverviewNode';

export default FinancialOverviewNode;
