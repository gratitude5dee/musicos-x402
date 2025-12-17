import React from 'react';
import { motion } from 'framer-motion';
import { Mic, PhoneOff } from 'lucide-react';
import VoiceOrb from '../VoiceOrb';
import useVapi from '@/hooks/use-vapi';

const VoiceOrbCard = () => {
  const { volumeLevel, isSessionActive, toggleCall } = useVapi();

  return (
    <div className="liquid-glass-card rounded-2xl p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Talk to Aria</h3>
          <p className="text-sm text-white/60">
            {isSessionActive ? 'Listening...' : 'Your AI assistant'}
          </p>
        </div>
        <motion.div
          className={`w-2 h-2 rounded-full ${isSessionActive ? 'bg-green-500' : 'bg-white/30'}`}
          animate={isSessionActive ? { scale: [1, 1.2, 1], opacity: [1, 0.7, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center min-h-[180px]">
        <VoiceOrb 
          volumeLevel={volumeLevel} 
          isSessionActive={isSessionActive}
          size={180}
        />
      </div>

      <motion.button
        onClick={toggleCall}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${
          isSessionActive 
            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
        }`}
      >
        {isSessionActive ? (
          <>
            <PhoneOff className="w-4 h-4" />
            End Call
          </>
        ) : (
          <>
            <Mic className="w-4 h-4" />
            Start Talking
          </>
        )}
      </motion.button>
    </div>
  );
};

export default VoiceOrbCard;
