import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface PremiumStatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  delay?: number;
}

export const PremiumStatsCard: React.FC<PremiumStatsCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor,
  iconBgColor,
  delay = 0
}) => {
  const changeColors = {
    positive: 'text-emerald-400',
    negative: 'text-red-400',
    neutral: 'text-muted-foreground'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="liquid-glass-card p-5 rounded-2xl flex items-center justify-between gap-4 cursor-pointer"
    >
      <div className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground font-medium">{title}</span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-foreground">{value}</span>
          {change && (
            <span className={`text-xs font-medium ${changeColors[changeType]}`}>
              {changeType === 'positive' ? '↑' : changeType === 'negative' ? '↓' : ''} {change}
            </span>
          )}
        </div>
      </div>
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: iconBgColor }}
      >
        <Icon className="w-6 h-6" style={{ color: iconColor }} />
      </div>
    </motion.div>
  );
};

export default PremiumStatsCard;
