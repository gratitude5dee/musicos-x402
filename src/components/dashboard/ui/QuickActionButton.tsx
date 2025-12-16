import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface QuickActionButtonProps {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  delay?: number;
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  label,
  icon: Icon,
  onClick,
  delay = 0
}) => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-left"
    >
      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
        <Icon className="w-4 h-4 text-purple-400" />
      </div>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </motion.button>
  );
};

export default QuickActionButton;
