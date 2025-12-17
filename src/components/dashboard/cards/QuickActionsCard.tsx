import React from 'react';
import { Zap } from 'lucide-react';
import { QuickActionButton } from '../ui/QuickActionButton';
import { Phone, Mail, Calendar, FileText } from 'lucide-react';

const QuickActionsCard = () => {
  const actions = [
    { icon: Phone, label: 'Schedule Call', color: '#06b6d4' },
    { icon: Mail, label: 'Send Email', color: '#22c55e' },
    { icon: Calendar, label: 'Book Meeting', color: '#a855f7' },
    { icon: FileText, label: 'Add Note', color: '#f59e0b' },
  ];

  return (
    <div className="liquid-glass-card rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-amber-500/20">
          <Zap className="w-4 h-4 text-amber-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
      </div>
      
      <div className="space-y-2">
        {actions.map((action, index) => (
          <QuickActionButton
            key={action.label}
            {...action}
            delay={index * 0.05}
          />
        ))}
      </div>
    </div>
  );
};

export default QuickActionsCard;
