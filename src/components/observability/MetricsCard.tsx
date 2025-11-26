import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricsCardProps {
  title: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = 'text-primary',
  trend = 'neutral'
}) => {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-500';
    if (trend === 'down') return 'text-red-500';
    return 'text-muted-foreground';
  };

  const getTrendSymbol = () => {
    if (trend === 'up') return '+';
    if (trend === 'down') return '-';
    return '';
  };

  return (
    <Card className="glass-card hover-scale hover:shadow-card-glow transition-all">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-[hsl(var(--text-primary))]">{title}</CardTitle>
        <Icon className={cn('h-5 w-5', iconColor)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-[hsl(var(--text-primary))]">{value}</div>
        {change !== undefined && (
          <p className={cn('text-xs mt-1', getTrendColor())}>
            {getTrendSymbol()}{Math.abs(change)}% {changeLabel || 'from last period'}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricsCard;
