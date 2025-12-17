import React from 'react';
import { Filter, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ContactListItem } from '../ui/ContactListItem';

const RecentContactsCard = () => {
  const contacts = [
    { id: '1', name: 'Sarah Johnson', subtitle: 'Warner Music', value: '$24,500', status: 'Active' as const, avatarColor: 'bg-gradient-to-br from-cyan-500 to-blue-500' },
    { id: '2', name: 'Michael Chen', subtitle: 'Sony Records', value: '$18,200', status: 'Prospect' as const, avatarColor: 'bg-gradient-to-br from-purple-500 to-pink-500' },
    { id: '3', name: 'Emily Davis', subtitle: 'Universal', value: '$32,100', status: 'Active' as const, avatarColor: 'bg-gradient-to-br from-green-500 to-emerald-500' },
    { id: '4', name: 'James Wilson', subtitle: 'Atlantic', value: '$15,800', status: 'Lead' as const, avatarColor: 'bg-gradient-to-br from-orange-500 to-amber-500' },
    { id: '5', name: 'Lisa Thompson', subtitle: 'Interscope', value: '$28,400', status: 'Active' as const, avatarColor: 'bg-gradient-to-br from-rose-500 to-red-500' },
  ];

  return (
    <div className="liquid-glass-card-draggable rounded-2xl h-full">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Recent Contacts</h3>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Filter className="w-4 h-4 text-white/60" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Download className="w-4 h-4 text-white/60" />
          </motion.button>
        </div>
      </div>
      <ScrollArea className="h-[320px]">
        <div className="p-2">
          {contacts.map((contact, index) => (
            <ContactListItem key={contact.id} name={contact.name} subtitle={contact.subtitle} value={contact.value} status={contact.status} avatarColor={contact.avatarColor} delay={index * 0.05} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default RecentContactsCard;
