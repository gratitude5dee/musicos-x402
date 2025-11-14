import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Activity, Zap } from 'lucide-react';
import CostOptimizer from '@/components/composer/CostOptimizer';

const ComposerAnalytics = () => {
  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Cost Analytics & Optimization
            </h1>
            <p className="text-muted-foreground mt-2">
              Monitor spending, track trends, and get recommendations to optimize your agent costs
            </p>
          </div>
        </div>
      </motion.div>

      {/* Cost Optimizer Component */}
      <CostOptimizer />
    </div>
  );
};

export default ComposerAnalytics;
