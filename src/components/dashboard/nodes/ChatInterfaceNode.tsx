import React, { memo } from 'react';
import { NodeResizer } from '@xyflow/react';
import { Bot, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ChatInterfaceNode = memo(() => {
  return (
    <>
      <NodeResizer minWidth={280} minHeight={320} />
      <div className="liquid-glass-card p-5 w-full h-full rounded-2xl flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center mb-4 relative"
        >
          <Bot className="w-10 h-10 text-purple-400" />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-purple-500/20"
          />
        </motion.div>
        
        <h3 className="text-xl font-bold text-foreground mb-1">Talk to our AI</h3>
        <p className="text-sm text-muted-foreground mb-1">Meet your creative assistant</p>
        <p className="text-lg font-semibold text-purple-400 mb-4">Nova ✨</p>
        
        <p className="text-xs text-muted-foreground mb-6 max-w-[200px]">
          Get instant help with music production, marketing strategies, and business insights
        </p>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium flex items-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          Start Chat
        </motion.button>
      </div>
    </>
  );
});

ChatInterfaceNode.displayName = 'ChatInterfaceNode';

export default ChatInterfaceNode;
