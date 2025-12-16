import React, { memo } from 'react';
import { NodeResizer } from '@xyflow/react';
import { Users, Filter, Download } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ContactListItem } from '../ui/ContactListItem';
import { motion } from 'framer-motion';

const RecentCreationsNode = memo(() => {
  const contacts = [
    { name: 'Sarah Johnson', subtitle: 'Universal Music', value: '$15,000', status: 'Active' as const, avatarColor: 'bg-gradient-to-br from-purple-500 to-pink-500' },
    { name: 'Mike Chen', subtitle: 'Sony Records', value: '$12,500', status: 'Active' as const, avatarColor: 'bg-gradient-to-br from-blue-500 to-cyan-500' },
    { name: 'Emma Wilson', subtitle: 'Atlantic Records', value: '$8,200', status: 'Prospect' as const, avatarColor: 'bg-gradient-to-br from-amber-500 to-orange-500' },
    { name: 'Alex Rivera', subtitle: 'Warner Music', value: '$6,800', status: 'Lead' as const, avatarColor: 'bg-gradient-to-br from-emerald-500 to-teal-500' },
    { name: 'Jordan Lee', subtitle: 'Independent', value: '$4,500', status: 'New' as const, avatarColor: 'bg-gradient-to-br from-rose-500 to-red-500' },
  ];

  return (
    <>
      <NodeResizer minWidth={380} minHeight={400} />
      <div className="liquid-glass-card p-5 w-full h-full rounded-2xl flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-foreground">Recent Contacts</h3>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Filter className="w-4 h-4 text-muted-foreground" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Download className="w-4 h-4 text-muted-foreground" />
            </motion.button>
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="space-y-1">
            {contacts.map((contact, index) => (
              <ContactListItem
                key={contact.name}
                {...contact}
                delay={index * 0.1}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    </>
  );
});

RecentCreationsNode.displayName = 'RecentCreationsNode';

export default RecentCreationsNode;
