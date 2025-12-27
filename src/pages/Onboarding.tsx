import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useThirdwebAuth } from '@/context/ThirdwebAuthContext';
import { OnboardingProvider } from '@/context/OnboardingContext';
import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import WelcomeStep from '@/components/onboarding/steps/WelcomeStep';
import DataConnectorsStep from '@/components/onboarding/steps/DataConnectorsStep';
import TrainingDataStep from '@/components/onboarding/steps/TrainingDataStep';
import PreferencesStep from '@/components/onboarding/steps/PreferencesStep';
import FinalizationStep from '@/components/onboarding/steps/FinalizationStep';

const OnboardingPage = () => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { onboardingCompleted, hasSynced, isLoading } = useThirdwebAuth();

  // Redirect to home if user already completed onboarding
  useEffect(() => {
    console.log('Onboarding check:', { hasSynced, onboardingCompleted, isLoading });
    if (hasSynced && onboardingCompleted) {
      console.log('Redirecting to /home - onboarding already completed');
      navigate('/home', { replace: true });
    }
  }, [hasSynced, onboardingCompleted, navigate, isLoading]);

  const nextStep = () => setStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  const steps = [
    <WelcomeStep key="welcome" onNext={nextStep} />,
    <DataConnectorsStep key="connectors" onNext={nextStep} onBack={prevStep} />,
    <TrainingDataStep key="training" onNext={nextStep} onBack={prevStep} />,
    <PreferencesStep key="preferences" onNext={nextStep} onBack={prevStep} />,
    <FinalizationStep key="finalization" />,
  ];

  // Clamp step to valid range
  const safeStep = Math.max(0, Math.min(step, steps.length - 1));
  const currentStepComponent = steps[safeStep];

  // Show loading if we're still syncing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Fallback if somehow step component is undefined
  if (!currentStepComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-white">
        <div className="text-center">
          <p className="text-lg mb-4">Something went wrong with the onboarding flow.</p>
          <button 
            onClick={() => setStep(0)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Restart Onboarding
          </button>
        </div>
      </div>
    );
  }

  return (
    <OnboardingProvider>
      <OnboardingLayout currentStep={safeStep} totalSteps={steps.length}>
        <AnimatePresence mode="wait">
          <motion.div
            key={safeStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="relative z-10"
          >
            {currentStepComponent}
          </motion.div>
        </AnimatePresence>
      </OnboardingLayout>
    </OnboardingProvider>
  );
};

export default OnboardingPage;
