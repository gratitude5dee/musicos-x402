import React from 'react';
import { motion } from 'framer-motion';

interface ActivityFeedItemProps {
  description: string;
  timestamp: string;
  status?: 'success' | 'info' | 'warning' | 'error';
  delay?: number;
}

export const ActivityFeedItem: React.FC<ActivityFeedItemProps> = ({
  description,
  timestamp,
  status = 'info',
  delay = 0
}) => {
  const statusColors = {
    success: 'bg-emerald-500',
    info: 'bg-blue-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      className="flex items-start gap-3 py-3"
    >
      <div className="relative mt-1.5">
        <div className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-px h-8 bg-white/10" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">{description}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{timestamp}</p>
      </div>
    </motion.div>
  );
};

export default ActivityFeedItem;
