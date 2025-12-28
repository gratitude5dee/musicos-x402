import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Zap } from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

const FinalizationStep = () => {
  const { connectedAccounts, uploadedFiles, preferences, saveOnboardingData, loading: saveLoading } = useOnboarding();
  const navigate = useNavigate();
  const [isFinalizing, setIsFinalizing] = useState(false);

  const handleFinalize = async () => {
    setIsFinalizing(true);
    
    try {
      // Wait for save to complete successfully before navigating
      await saveOnboardingData();
      
      // Only trigger confetti and navigate if save was successful
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
      
      // Small delay for confetti effect, then navigate
      setTimeout(() => {
        navigate('/home');
      }, 1500);
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      // Stay on page - user will see the error toast from OnboardingContext
      setIsFinalizing(false);
    }
  };
  
  return (
    <motion.div
      className="relative p-8 lg:p-10 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] shadow-2xl max-w-3xl mx-auto text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />
      
      <div className="relative">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
          className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center mb-6"
        >
          <CheckCircle className="h-10 w-10 text-white"/>
        </motion.div>

        <h2 className="text-2xl lg:text-3xl font-bold mb-3 text-white">Genesis Complete</h2>
        <p className="text-white/50 mb-8">Your Creator OS has been aligned with your essence.</p>
        
        <motion.div
          className="text-left bg-white/[0.02] border border-white/[0.06] rounded-xl p-6"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <SummaryItem label="Creative Archetype" value="The Universalist" />
            <SummaryItem label="Preferred LLM" value={preferences.llm} />
            <SummaryItem label="Connected Accounts" value={connectedAccounts.length.toString()} />
            <SummaryItem label="Training Files" value={uploadedFiles.length.toString()} />
            <SummaryItem label="Default Chain" value={preferences.chain} />
            <SummaryItem label="Creative Style" value={preferences.style} />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Button
            onClick={handleFinalize}
            disabled={isFinalizing || saveLoading}
            size="lg"
            className="mt-8 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white border-0 font-semibold py-6 px-10 rounded-2xl shadow-lg shadow-purple-500/20 hover:scale-105 transition-all duration-300"
          >
            {isFinalizing || saveLoading ? 'Entering Studio...' : 'Enter Your Creative Studio'}
            <Zap className="ml-2 h-5 w-5"/>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

const SummaryItem: React.FC<{label: string, value: string | number}> = ({ label, value }) => (
  <div>
    <span className="text-xs text-white/40 uppercase tracking-wide">{label}</span>
    <span className="block font-semibold text-white/90 mt-1">{value}</span>
  </div>
);

export default FinalizationStep;
