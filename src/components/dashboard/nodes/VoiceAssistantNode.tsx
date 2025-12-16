import React, { memo } from 'react';
import { NodeResizer } from '@xyflow/react';
import { Zap, Phone, Mail, Calendar, StickyNote } from 'lucide-react';
import { QuickActionButton } from '../ui/QuickActionButton';

const VoiceAssistantNode = memo(() => {
  const actions = [
    { label: 'Schedule Call', icon: Phone },
    { label: 'Send Email', icon: Mail },
    { label: 'Book Meeting', icon: Calendar },
    { label: 'Add Note', icon: StickyNote },
  ];

  return (
    <>
      <NodeResizer minWidth={280} minHeight={280} />
      <div className="liquid-glass-card p-5 w-full h-full rounded-2xl flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
        </div>
        
        <div className="space-y-2 flex-1">
          {actions.map((action, index) => (
            <QuickActionButton
              key={action.label}
              {...action}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </>
  );
});

VoiceAssistantNode.displayName = 'VoiceAssistantNode';

export default VoiceAssistantNode;
