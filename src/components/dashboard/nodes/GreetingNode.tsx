import React, { memo } from 'react';
import { NodeResizer } from '@xyflow/react';
import { SearchHeader } from '../ui/SearchHeader';

const GreetingNode = memo(() => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <>
      <NodeResizer minWidth={500} minHeight={100} />
      <div className="liquid-glass-card p-6 w-full h-full rounded-2xl">
        <SearchHeader 
          greeting={`${getGreeting()}, Creator ✨`}
          subtitle="Here's what's happening with your creative empire today"
        />
      </div>
    </>
  );
});

GreetingNode.displayName = 'GreetingNode';

export default GreetingNode;
