import React from 'react';
import { Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { ProgressTarget } from '../ui/ProgressTarget';

const RevenueTargetsCard = () => {
  return (
    <div className="liquid-glass-card rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Revenue Targets</h3>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          <Settings className="w-4 h-4 text-white/60" />
        </motion.button>
      </div>
      
      <div className="space-y-4">
        <ProgressTarget
          label="Monthly Target"
          current={8420}
          target={10000}
          color="from-cyan-500 to-blue-500"
        />
        <ProgressTarget
          label="Quarterly Target"
          current={24500}
          target={35000}
          color="from-purple-500 to-pink-500"
        />
      </div>

      <div className="mt-4 pt-4 border-t border-white/5">
        <p className="text-sm text-white/60 mb-2">Team Performance</p>
        <div className="flex gap-1 h-2 rounded-full overflow-hidden">
          <motion.div 
            className="bg-gradient-to-r from-green-500 to-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: '45%' }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
          <motion.div 
            className="bg-gradient-to-r from-blue-500 to-cyan-500"
            initial={{ width: 0 }}
            animate={{ width: '30%' }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />
          <motion.div 
            className="bg-gradient-to-r from-amber-500 to-orange-500"
            initial={{ width: 0 }}
            animate={{ width: '25%' }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-white/40">
          <span>Sales 45%</span>
          <span>Marketing 30%</span>
          <span>Support 25%</span>
        </div>
      </div>
    </div>
  );
};

export default RevenueTargetsCard;
