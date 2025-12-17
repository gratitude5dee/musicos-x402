import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

const AIChatCard = () => {
  return (
    <div className="liquid-glass-card rounded-2xl p-6">
      <div className="flex flex-col items-center text-center">
        <motion.div
          className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4"
          animate={{ 
            boxShadow: [
              '0 0 20px rgba(168, 85, 247, 0.3)',
              '0 0 40px rgba(168, 85, 247, 0.5)',
              '0 0 20px rgba(168, 85, 247, 0.3)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-2xl">🤖</span>
        </motion.div>
        
        <h3 className="text-lg font-semibold text-white mb-1">Talk to our new AI</h3>
        <p className="text-sm text-white/60 mb-4">Meet Aria, your creative assistant</p>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium"
        >
          <MessageCircle className="w-4 h-4" />
          Start Chat
        </motion.button>
      </div>
    </div>
  );
};

export default AIChatCard;
