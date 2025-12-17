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
const DEFAULT_ORDER = ['contacts', 'targets', 'actions', 'voice', 'activity'];

const DraggableGrid = () => {
  const [cardOrder, setCardOrder] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_ORDER;
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
      case 'voice':
        return <VoiceOrbCard />;
      case 'activity':
        return <RecentActivityCard />;
      default:
        return null;
    }
  };

  const getCardSpan = (cardId: string) => {
    switch (cardId) {
      case 'contacts':
        return 'lg:col-span-4';
      case 'targets':
        return 'lg:col-span-4';
      case 'actions':
        return 'lg:col-span-4';
      case 'voice':
        return 'lg:col-span-6';
      case 'activity':
        return 'lg:col-span-6';
      default:
        return 'lg:col-span-4';
    }
  };

  return (
    <div className="space-y-6">
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

      {/* Draggable Cards Section */}
      <Reorder.Group
        axis="y"
        values={cardOrder}
        onReorder={setCardOrder}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6"
      >
        {cardOrder.map((cardId, index) => (
          <DraggableCard
            key={cardId}
            id={cardId}
            className={`col-span-1 md:col-span-1 ${getCardSpan(cardId)}`}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
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
        transition={{ delay: 1 }}
        className="text-center text-white/40 text-sm"
      >
        Drag cards to rearrange your dashboard
      </motion.p>
    </div>
  );
};

export default DraggableGrid;
