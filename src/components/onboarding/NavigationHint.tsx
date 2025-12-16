import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface NavigationHintProps {
  showBack?: boolean;
  className?: string;
}

const NavigationHint: React.FC<NavigationHintProps> = ({ showBack = false, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 0.5 }}
      className={`flex items-center justify-center gap-6 text-sm text-white/40 ${className}`}
    >
      {showBack && (
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 rounded bg-white/10 border border-white/10 text-xs font-mono">
            <ArrowLeft className="w-3 h-3 inline" />
          </kbd>
          <span>Back</span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <span>Continue</span>
        <kbd className="px-2 py-1 rounded bg-white/10 border border-white/10 text-xs font-mono">
          <ArrowRight className="w-3 h-3 inline" />
        </kbd>
        <span className="text-white/30">or</span>
        <kbd className="px-2 py-1 rounded bg-white/10 border border-white/10 text-xs font-mono">Enter</kbd>
      </div>
    </motion.div>
  );
};

export default NavigationHint;
