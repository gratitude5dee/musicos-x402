import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useOnboarding } from '@/context/OnboardingContext';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import NavigationHint from '../NavigationHint';

interface WelcomeStepProps {
  onNext: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { setCreatorName } = useOnboarding();
  const { handleNext } = useOnboardingNavigation({ onNext });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div 
      className="relative min-h-[80vh] flex items-center justify-center cursor-pointer"
      onClick={handleNext}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
        className="relative z-10 w-full max-w-3xl mx-auto px-4"
      >
        {/* Premium Glass Card */}
        <div className="relative p-10 lg:p-14 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] shadow-2xl">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
          
          {/* Main content */}
          <div className="relative text-center space-y-8">
            <motion.div variants={itemVariants}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                className="inline-block mb-6"
              >
                <div className="relative p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
              </motion.div>

              <h1 className="text-4xl lg:text-6xl font-bold mb-4">
                <span className="text-white/90">Welcome to</span>
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  UniversalAI
                </span>
              </h1>
            </motion.div>

            <motion.div variants={itemVariants}>
              <p className="text-lg text-white/60 max-w-xl mx-auto leading-relaxed">
                Begin the <span className="text-cyan-400/80 font-medium">Genesis Ritual</span> to align 
                the Creator OS with your unique essence and creative spirit.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-6">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                size="lg"
                className="
                  relative px-10 py-6 text-lg font-semibold
                  bg-gradient-to-r from-purple-600 to-pink-600
                  hover:from-purple-500 hover:to-pink-500
                  text-white rounded-2xl border-0
                  hover:scale-105 active:scale-95
                  transition-all duration-300
                  shadow-lg shadow-purple-500/25
                  hover:shadow-xl hover:shadow-purple-500/30
                  focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:ring-offset-2 focus:ring-offset-transparent
                "
              >
                <span>Begin the Ritual</span>
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="ml-3"
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </Button>
            </motion.div>

            {/* Navigation hint */}
            <motion.div variants={itemVariants} className="pt-4">
              <NavigationHint />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomeStep;
