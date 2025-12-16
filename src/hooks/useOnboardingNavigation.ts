import { useEffect, useCallback } from 'react';

interface UseOnboardingNavigationProps {
  onNext: () => void;
  onBack?: () => void;
  disabled?: boolean;
}

export const useOnboardingNavigation = ({ 
  onNext, 
  onBack, 
  disabled = false 
}: UseOnboardingNavigationProps) => {
  
  const handleNext = useCallback(() => {
    if (!disabled) onNext();
  }, [onNext, disabled]);

  const handleBack = useCallback(() => {
    if (!disabled && onBack) onBack();
  }, [onBack, disabled]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (disabled) return;
      
      // Prevent navigation if user is typing in an input
      const target = event.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || 
                      target.tagName === 'TEXTAREA' || 
                      target.contentEditable === 'true' ||
                      target.closest('[role="combobox"]') ||
                      target.closest('[role="listbox"]');
      
      if (isTyping) return;

      switch (event.key) {
        case 'Enter':
        case ' ':
        case 'ArrowRight':
          event.preventDefault();
          handleNext();
          break;
        case 'ArrowLeft':
        case 'Escape':
          if (onBack) {
            event.preventDefault();
            handleBack();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handleBack, onBack, disabled]);

  const handleAreaClick = (event: React.MouseEvent) => {
    if (disabled) return;
    
    const target = event.target as HTMLElement;
    const isInteractive = target.closest('button') || 
                         target.closest('input') || 
                         target.closest('select') ||
                         target.closest('[role="button"]') ||
                         target.closest('[role="combobox"]') ||
                         target.closest('.dropzone') ||
                         target.hasAttribute('data-interactive');
    
    if (!isInteractive && event.target === event.currentTarget) {
      handleNext();
    }
  };

  return { handleAreaClick, handleNext, handleBack };
};