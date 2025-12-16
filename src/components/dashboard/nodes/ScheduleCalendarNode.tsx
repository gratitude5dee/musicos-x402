import React, { memo } from 'react';
import { NodeResizer } from '@xyflow/react';
import { Activity } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ActivityFeedItem } from '../ui/ActivityFeedItem';

const ScheduleCalendarNode = memo(() => {
  const activities = [
    { description: 'New fan subscription from Sarah M.', timestamp: '2 min ago', status: 'success' as const },
    { description: 'Track "Midnight Dreams" reached 10K plays', timestamp: '15 min ago', status: 'success' as const },
    { description: 'Meeting with Sony Records scheduled', timestamp: '1 hour ago', status: 'info' as const },
    { description: 'Royalty payment of $1,250 received', timestamp: '2 hours ago', status: 'success' as const },
    { description: 'New collaboration request pending', timestamp: '3 hours ago', status: 'warning' as const },
    { description: 'Album release date confirmed', timestamp: '5 hours ago', status: 'info' as const },
  ];

  return (
    <>
      <NodeResizer minWidth={300} minHeight={350} />
      <div className="liquid-glass-card p-5 w-full h-full rounded-2xl flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="pr-2">
            {activities.map((activity, index) => (
              <ActivityFeedItem
                key={index}
                {...activity}
                delay={index * 0.1}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    </>
  );
});

ScheduleCalendarNode.displayName = 'ScheduleCalendarNode';

export default ScheduleCalendarNode;
