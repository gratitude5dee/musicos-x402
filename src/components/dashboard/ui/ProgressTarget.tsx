import React from 'react';
import { motion } from 'framer-motion';

interface ProgressTargetProps {
  label: string;
  current: number;
  target: number;
  color?: string;
  delay?: number;
}

export const ProgressTarget: React.FC<ProgressTargetProps> = ({
  label,
  current,
  target,
  color = 'from-purple-500 to-pink-500',
  delay = 0
}) => {
  const percentage = Math.min((current / target) * 100, 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm text-muted-foreground">
          {percentage.toFixed(0)}% achieved
        </span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay, ease: 'easeOut' }}
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>${current.toLocaleString()}</span>
        <span>Target: ${target.toLocaleString()}</span>
      </div>
    </div>
  );
};

export default ProgressTarget;
