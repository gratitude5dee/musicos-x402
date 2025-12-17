import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ActivityFeedItem } from '../ui/ActivityFeedItem';

const RecentActivityCard = () => {
  const activities = [
    { id: '1', description: 'New contract signed with Warner Music', timestamp: '2 min ago', status: 'success' as const },
    { id: '2', description: 'Royalty payment received - $2,450', timestamp: '15 min ago', status: 'success' as const },
    { id: '3', description: 'Meeting scheduled with Sony Records', timestamp: '1 hour ago', status: 'info' as const },
    { id: '4', description: 'New fan milestone: 45K followers', timestamp: '3 hours ago', status: 'success' as const },
    { id: '5', description: 'Contract review pending approval', timestamp: '5 hours ago', status: 'warning' as const },
  ];

  return (
    <div className="liquid-glass-card-draggable rounded-2xl h-full">
      <div className="p-4 border-b border-white/5">
        <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
      </div>
      <ScrollArea className="h-[200px]">
        <div className="p-4 space-y-1">
          {activities.map((activity, index) => (
            <ActivityFeedItem key={activity.id} description={activity.description} timestamp={activity.timestamp} status={activity.status} delay={index * 0.05} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default RecentActivityCard;
