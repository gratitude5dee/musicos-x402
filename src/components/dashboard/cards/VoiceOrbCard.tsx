import React from 'react';
import { motion } from 'framer-motion';
import { Mic, PhoneOff, Sparkles } from 'lucide-react';
import VoiceOrb from '../VoiceOrb';
import useVapi from '@/hooks/use-vapi';

const VoiceOrbCard = () => {
  const { volumeLevel, isSessionActive, toggleCall } = useVapi();

  return (
    <div className="liquid-glass-card-hero rounded-3xl p-8 flex flex-col items-center max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <motion.div 
          className="flex items-center justify-center gap-2 mb-2"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-xs uppercase tracking-widest text-white/50 font-medium">AI Assistant</span>
          <Sparkles className="w-4 h-4 text-cyan-400" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-1">Talk to Aria</h2>
        <motion.p 
          className="text-sm text-white/60"
          animate={isSessionActive ? { opacity: [0.6, 1, 0.6] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {isSessionActive ? '● Listening...' : 'Tap to start a conversation'}
        </motion.p>
      </div>

      {/* Voice Orb Container */}
      <div className="relative flex items-center justify-center mb-6">
        {/* Outer glow ring */}
        <motion.div 
          className="absolute w-[320px] h-[320px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
          }}
          animate={isSessionActive ? { 
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5]
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        {/* Inner glow ring */}
        <motion.div 
          className="absolute w-[280px] h-[280px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 60%)',
          }}
          animate={{ 
            rotate: 360,
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />

        <VoiceOrb 
          volumeLevel={volumeLevel} 
          isSessionActive={isSessionActive}
          size={240}
        />
      </div>

      {/* Action Button */}
      <motion.button
        onClick={toggleCall}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`w-full max-w-xs flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${
          isSessionActive 
            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' 
            : 'bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40'
        }`}
      >
        {isSessionActive ? (
          <>
            <PhoneOff className="w-5 h-5" />
            End Conversation
          </>
        ) : (
          <>
            <Mic className="w-5 h-5" />
            Start Talking
          </>
        )}
      </motion.button>

      {/* Status indicator */}
      <div className="mt-4 flex items-center gap-2">
        <motion.div
          className={`w-2 h-2 rounded-full ${isSessionActive ? 'bg-green-500' : 'bg-white/30'}`}
          animate={isSessionActive ? { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <span className="text-xs text-white/40">
          {isSessionActive ? 'Connected' : 'Ready'}
        </span>
      </div>
    </div>
  );
};

export default VoiceOrbCard;
