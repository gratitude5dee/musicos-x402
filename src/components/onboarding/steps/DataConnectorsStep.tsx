import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, CheckCircle, Twitter, Github, Figma, Database, FileText, Share2 } from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingNavigation } from '@/hooks/useOnboardingNavigation';
import NavigationHint from '../NavigationHint';

interface Connector {
  id: string;
  name: string;
  icon: React.ElementType;
}

interface DataConnectorsStepProps {
  onNext: () => void;
  onBack: () => void;
}

const connectors: Connector[] = [
  { id: 'twitter', name: 'Twitter / X', icon: Twitter },
  { id: 'google_drive', name: 'Google Drive', icon: Database },
  { id: 'github', name: 'GitHub', icon: Github },
  { id: 'notion', name: 'Notion', icon: FileText },
  { id: 'dropbox', name: 'Dropbox', icon: Share2 },
  { id: 'figma', name: 'Figma', icon: Figma }
];

const DataConnectorsStep: React.FC<DataConnectorsStepProps> = ({ onNext, onBack }) => {
  const { connectedAccounts, toggleConnectedAccount } = useOnboarding();
  const { handleAreaClick } = useOnboardingNavigation({ onNext, onBack });

  return (
    <div 
      className="relative p-8 lg:p-10 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] shadow-2xl max-w-3xl mx-auto cursor-pointer"
      onClick={handleAreaClick}
      role="button"
      tabIndex={0}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />
      
      <div className="relative">
        <div className="text-center mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">Connect the Constellations</h2>
          <p className="text-white/50">Link your digital universe to provide context for your AI.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {connectors.map((connector, index) => {
            const isConnected = connectedAccounts.includes(connector.id);
            const IconComponent = connector.icon;
            return (
              <motion.div
                key={connector.id}
                className={`relative p-5 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 border ${
                  isConnected 
                    ? 'bg-cyan-500/10 border-cyan-500/30' 
                    : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12]'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleConnectedAccount(connector.id);
                }}
                data-interactive="true"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ y: -3 }}
              >
                <AnimatePresence>
                  {isConnected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="absolute top-2 right-2"
                    >
                      <CheckCircle className="h-5 w-5 text-cyan-400" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <IconComponent className={`w-8 h-8 mb-2 ${isConnected ? 'text-cyan-400' : 'text-white/60'}`}/>
                <span className={`text-sm font-medium ${isConnected ? 'text-cyan-50' : 'text-white/70'}`}>
                  {connector.name}
                </span>
              </motion.div>
            );
          })}
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
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        
        <NavigationHint showBack className="mt-6" />
      </div>
    </div>
  );
};

export default DataConnectorsStep;
