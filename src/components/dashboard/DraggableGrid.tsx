import React, { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import DraggableCard from './DraggableCard';
import GreetingCard from './cards/GreetingCard';
import StatsRow from './cards/StatsRow';
import RecentContactsCard from './cards/RecentContactsCard';
import RevenueTargetsCard from './cards/RevenueTargetsCard';
import QuickActionsCard from './cards/QuickActionsCard';
import VoiceOrbCard from './cards/VoiceOrbCard';
import RecentActivityCard from './cards/RecentActivityCard';

const STORAGE_KEY = 'dashboard-card-order';
const DEFAULT_ORDER = ['contacts', 'targets', 'actions', 'activity'];

const DraggableGrid = () => {
  const [cardOrder, setCardOrder] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : DEFAULT_ORDER;
      // Filter out 'voice' if it exists in saved order (migrating old data)
      return parsed.filter((id: string) => id !== 'voice');
    }
    return DEFAULT_ORDER;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cardOrder));
  }, [cardOrder]);

  const renderCard = (cardId: string) => {
    switch (cardId) {
      case 'contacts':
        return <RecentContactsCard />;
      case 'targets':
        return <RevenueTargetsCard />;
      case 'actions':
        return <QuickActionsCard />;
      case 'activity':
        return <RecentActivityCard />;
      default:
        return null;
    }
  };

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
        className="flex justify-center"
      >
        <div className="relative">
          {/* Ambient glow rings */}
          <div className="absolute inset-0 -m-8 rounded-full bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-pink-500/20 blur-3xl animate-pulse" />
          <div className="absolute inset-0 -m-4 rounded-full bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10 blur-2xl" />
          <VoiceOrbCard />
        </div>
      </motion.div>

      {/* Draggable Cards Section */}
      <Reorder.Group
        axis="y"
        values={cardOrder}
        onReorder={setCardOrder}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {cardOrder.map((cardId, index) => (
          <DraggableCard
            key={cardId}
            id={cardId}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              className="h-full"
            >
              {renderCard(cardId)}
            </motion.div>
          </DraggableCard>
        ))}
      </Reorder.Group>

      {/* Drag hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-center text-white/30 text-sm"
      >
        ✦ Grab any card to rearrange your dashboard ✦
      </motion.p>
    </div>
  );
};

export default DraggableGrid;
