import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Cpu, Link2, Palette } from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import NavigationHint from '../NavigationHint';

interface PreferencesStepProps {
  onNext: () => void;
  onBack: () => void;
}

const PreferencesStep: React.FC<PreferencesStepProps> = ({ onNext, onBack }) => {
  const { preferences, setPreferences } = useOnboarding();
  const { handleAreaClick } = useOnboardingNavigation({ onNext, onBack });

  return (
    <div 
      className="relative p-8 lg:p-10 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] shadow-2xl max-w-3xl mx-auto cursor-pointer"
      onClick={handleAreaClick}
      role="button"
      tabIndex={0}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
      
      <div className="relative">
        <div className="text-center mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">Tuning the Orrery</h2>
          <p className="text-white/50">Set the core parameters for your AI and creative environment.</p>
        </div>
        
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white/[0.02] border border-white/[0.06] p-4 rounded-xl">
              <label className="flex items-center text-sm font-medium text-white/70 mb-3">
                <Cpu className="mr-2 h-4 w-4 text-purple-400"/> Preferred LLM
              </label>
              <Select value={preferences.llm} onValueChange={(value) => setPreferences({ llm: value })}>
                <SelectTrigger 
                  className="w-full bg-white/[0.03] border-white/[0.08] text-white" 
                  data-interactive="true"
                  onClick={(e) => e.stopPropagation()}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                  <SelectItem value="llama-3">Llama 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-white/[0.02] border border-white/[0.06] p-4 rounded-xl">
              <label className="flex items-center text-sm font-medium text-white/70 mb-3">
                <Link2 className="mr-2 h-4 w-4 text-cyan-400"/> Default Blockchain
              </label>
              <Select value={preferences.chain} onValueChange={(value) => setPreferences({ chain: value })}>
                <SelectTrigger 
                  className="w-full bg-white/[0.03] border-white/[0.08] text-white" 
                  data-interactive="true"
                  onClick={(e) => e.stopPropagation()}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ethereum">Ethereum</SelectItem>
                  <SelectItem value="solana">Solana</SelectItem>
                  <SelectItem value="base">Base</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.06] p-4 rounded-xl">
            <label className="flex items-center text-sm font-medium text-white/70 mb-3">
              <Palette className="mr-2 h-4 w-4 text-pink-400"/> Creative Style
            </label>
            <Select value={preferences.style} onValueChange={(value) => setPreferences({ style: value })}>
              <SelectTrigger 
                className="w-full bg-white/[0.03] border-white/[0.08] text-white" 
                data-interactive="true"
                onClick={(e) => e.stopPropagation()}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="expressive">Expressive</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="minimalist">Minimalist</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/[0.06]">
          <Button 
            variant="ghost" 
            onClick={(e) => { e.stopPropagation(); onBack(); }}
            className="text-white/60 hover:text-white hover:bg-white/5"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button 
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0"
          >
            Finalize <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        
        <NavigationHint showBack className="mt-6" />
      </div>
    </div>
  );
};

export default PreferencesStep;
