import React from 'react';
import { motion } from 'framer-motion';
import GreetingCard from './cards/GreetingCard';
import StatsRow from './cards/StatsRow';
import RecentContactsCard from './cards/RecentContactsCard';
import RevenueTargetsCard from './cards/RevenueTargetsCard';
import QuickActionsCard from './cards/QuickActionsCard';
import AIChatCard from './cards/AIChatCard';
import RecentActivityCard from './cards/RecentActivityCard';

const DashboardGrid = () => {
  return (
    <div className="w-full space-y-6">
      {/* Row 1: Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <GreetingCard />
      </motion.div>

      {/* Row 2: Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <StatsRow />
      </motion.div>

      {/* Row 3: Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Recent Contacts */}
        <motion.div
          className="lg:col-span-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <RecentContactsCard />
        </motion.div>

        {/* Center Column - Revenue Targets + AI Chat */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <RevenueTargetsCard />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <AIChatCard />
          </motion.div>
        </div>

        {/* Right Column - Quick Actions + Activity */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
          >
            <QuickActionsCard />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.45 }}
          >
            <RecentActivityCard />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashboardGrid;
