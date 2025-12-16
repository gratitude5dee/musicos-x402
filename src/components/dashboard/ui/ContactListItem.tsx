import React from 'react';
import { motion } from 'framer-motion';

interface ContactListItemProps {
  name: string;
  subtitle: string;
  value?: string;
  status?: 'Active' | 'Prospect' | 'Lead' | 'New';
  avatarColor?: string;
  delay?: number;
}

export const ContactListItem: React.FC<ContactListItemProps> = ({
  name,
  subtitle,
  value,
  status,
  avatarColor = 'bg-gradient-to-br from-purple-500 to-pink-500',
  delay = 0
}) => {
  const statusColors = {
    Active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    Prospect: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    Lead: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    New: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  };

  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.05)' }}
      className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors"
    >
      <div className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center text-white text-sm font-semibold`}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{name}</p>
        <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
      </div>
      {value && (
        <span className="text-sm font-semibold text-foreground">{value}</span>
      )}
      {status && (
        <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[status]}`}>
          {status}
        </span>
      )}
    </motion.div>
  );
};

export default ContactListItem;
