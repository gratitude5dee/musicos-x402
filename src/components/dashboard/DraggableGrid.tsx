import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GreetingCard from './cards/GreetingCard';
import StatsRow from './cards/StatsRow';
import RecentContactsCard from './cards/RecentContactsCard';
import RevenueTargetsCard from './cards/RevenueTargetsCard';
import QuickActionsCard from './cards/QuickActionsCard';
import VoiceOrbCard from './cards/VoiceOrbCard';
import RecentActivityCard from './cards/RecentActivityCard';

const DraggableGrid = () => {
  return (
    <div className="space-y-8">
      {/* Static Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GreetingCard />
      </motion.div>

      {/* Static Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <StatsRow />
      </motion.div>

      {/* Aria Voice Orb - Centered Hero Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex justify-center py-8"
      >
        <div className="relative">
          {/* Ambient glow rings */}
          <div className="absolute inset-0 -m-8 rounded-full bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-pink-500/20 blur-3xl animate-pulse" />
          <div className="absolute inset-0 -m-4 rounded-full bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10 blur-2xl" />
          <VoiceOrbCard />
        </div>
      </motion.div>

      {/* Cards Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <RecentContactsCard />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <RevenueTargetsCard />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <QuickActionsCard />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <RecentActivityCard />
        </motion.div>
      </div>
    </div>
  );
};

export default DraggableGrid;
