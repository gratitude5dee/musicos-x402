import React, { useState, useEffect } from 'react';
import { Reorder, motion } from 'framer-motion';
import DraggableCard from './DraggableCard';
import GreetingCard from './cards/GreetingCard';
import StatsRow from './cards/StatsRow';
import RecentContactsCard from './cards/RecentContactsCard';
import RevenueTargetsCard from './cards/RevenueTargetsCard';
import QuickActionsCard from './cards/QuickActionsCard';
import VoiceOrbCard from './cards/VoiceOrbCard';
import RecentActivityCard from './cards/RecentActivityCard';
import { RecentCreationsCard } from './cards/RecentCreationsCard';

const CARD_IDS = ['creations', 'contacts', 'revenue', 'actions', 'activity'] as const;
type CardId = typeof CARD_IDS[number];

const DraggableGrid = () => {
  const [cardOrder, setCardOrder] = useState<CardId[]>([...CARD_IDS]);

  // Load saved order from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('dashboardCardOrder');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as CardId[];
        // Validate that all cards are present
        if (CARD_IDS.every(id => parsed.includes(id))) {
          setCardOrder(parsed);
        }
      } catch (e) {
        console.error('Failed to parse saved card order:', e);
      }
    }
  }, []);

  // Save order to localStorage
  useEffect(() => {
    localStorage.setItem('dashboardCardOrder', JSON.stringify(cardOrder));
  }, [cardOrder]);

  const renderCard = (id: CardId) => {
    switch (id) {
      case 'creations':
        return <RecentCreationsCard />;
      case 'contacts':
        return <RecentContactsCard />;
      case 'revenue':
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
        className="flex justify-center py-8"
      >
        <div className="relative">
          {/* Ambient glow rings */}
          <div className="absolute inset-0 -m-8 rounded-full bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-pink-500/20 blur-3xl animate-pulse" />
          <div className="absolute inset-0 -m-4 rounded-full bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10 blur-2xl" />
          <VoiceOrbCard />
        </div>
      </motion.div>

      {/* Draggable Cards Grid Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Reorder.Group
          axis="y"
          values={cardOrder}
          onReorder={setCardOrder}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {cardOrder.map((id) => (
            <DraggableCard key={id} id={id}>
              {renderCard(id)}
            </DraggableCard>
          ))}
        </Reorder.Group>
      </motion.div>
    </div>
  );
};

export default DraggableGrid;
