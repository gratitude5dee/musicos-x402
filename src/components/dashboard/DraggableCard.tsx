import React from 'react';
import { Reorder } from 'framer-motion';
import { GripVertical } from 'lucide-react';

interface DraggableCardProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

const DraggableCard: React.FC<DraggableCardProps> = ({ id, children, className = '' }) => {
  return (
    <Reorder.Item
      value={id}
      id={id}
      className={`relative group cursor-grab active:cursor-grabbing ${className}`}
      whileHover={{ 
        scale: 1.01,
        transition: { duration: 0.2 }
      }}
      whileDrag={{ 
        scale: 1.03, 
        zIndex: 50,
        boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.6), 0 0 40px rgba(139, 92, 246, 0.3)',
        rotate: 1,
      }}
      transition={{ 
        type: 'spring',
        stiffness: 300,
        damping: 25
      }}
    >
      {/* Drag Handle Indicator - Top Bar */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 px-4 py-1 rounded-b-lg bg-white/5 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 rounded-full bg-white/40" />
          <div className="w-1 h-1 rounded-full bg-white/40" />
          <div className="w-1 h-1 rounded-full bg-white/40" />
        </div>
      </div>
      
      {/* Drag Handle Icon - Corner */}
      <div className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
        <GripVertical className="w-4 h-4 text-white/50" />
      </div>

      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/0 via-cyan-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:via-cyan-500/10 group-hover:to-pink-500/10 transition-all duration-500 pointer-events-none" />
      
      {children}
    </Reorder.Item>
  );
};

export default DraggableCard;
