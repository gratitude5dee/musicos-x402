import React from 'react';
import { SearchHeader } from '../ui/SearchHeader';

const GreetingCard = () => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="liquid-glass-card p-6 rounded-2xl">
      <SearchHeader 
        greeting={`${getGreeting()}, Creator ✨`}
        subtitle="Here's what's happening with your creative empire today"
      />
    </div>
  );
};

export default GreetingCard;
