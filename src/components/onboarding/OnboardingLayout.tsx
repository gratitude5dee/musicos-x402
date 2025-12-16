import React, { ReactNode } from 'react';
import OnboardingProgress from './OnboardingProgress';
import CloudShader from '@/components/ui/shaders/CloudShader';

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
}

const OnboardingLayout = ({ children, currentStep, totalSteps }: OnboardingLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* CloudShader background */}
      <div className="fixed inset-0 z-0">
        <CloudShader />
      </div>
      
      {/* Progress bar - sticky at top */}
      <div className="sticky top-0 z-20 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <OnboardingProgress currentStep={currentStep + 1} totalSteps={totalSteps} />
        </div>
      </div>
      
      {/* Main content */}
      <main className="flex-1 flex items-center justify-center relative z-10 px-4 py-8">
        <div className="w-full max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default OnboardingLayout;