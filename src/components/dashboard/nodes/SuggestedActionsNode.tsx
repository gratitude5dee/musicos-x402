import React, { memo } from 'react';
import { NodeResizer } from '@xyflow/react';
import { Target, Settings } from 'lucide-react';
import { ProgressTarget } from '../ui/ProgressTarget';
import { motion } from 'framer-motion';

const SuggestedActionsNode = memo(() => {
  return (
    <>
      <NodeResizer minWidth={320} minHeight={280} />
      <div className="liquid-glass-card p-5 w-full h-full rounded-2xl flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-foreground">Revenue Targets</h3>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Settings className="w-4 h-4 text-muted-foreground" />
          </motion.button>
        </div>
        
        <div className="space-y-6 flex-1">
          <ProgressTarget
            label="Monthly Target"
            current={8500}
            target={12000}
            color="from-purple-500 to-pink-500"
            delay={0.1}
          />
          
          <ProgressTarget
            label="Quarterly Target"
            current={28000}
            target={40000}
            color="from-cyan-500 to-blue-500"
            delay={0.2}
          />
          
          <div className="pt-4 border-t border-white/10">
            <p className="text-sm font-medium text-foreground mb-3">Team Performance</p>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden flex">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '35%' }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="bg-emerald-500 h-full" 
              />
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '25%' }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="bg-blue-500 h-full" 
              />
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '20%' }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="bg-purple-500 h-full" 
              />
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '15%' }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="bg-amber-500 h-full" 
              />
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Sales</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Marketing</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> Support</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

SuggestedActionsNode.displayName = 'SuggestedActionsNode';

export default SuggestedActionsNode;
