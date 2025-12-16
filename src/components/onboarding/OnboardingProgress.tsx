import React from 'react';
import { motion } from 'framer-motion';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

const OnboardingProgress = ({ currentStep, totalSteps }: OnboardingProgressProps) => {
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium text-white/40">Genesis Process</span>
        <span className="text-xs font-mono text-white/60">Step {currentStep} / {totalSteps}</span>
      </div>
      <div className="w-full bg-white/[0.06] rounded-full h-1 backdrop-blur-sm overflow-hidden">
        <motion.div
          className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full h-1"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

export default OnboardingProgress;
