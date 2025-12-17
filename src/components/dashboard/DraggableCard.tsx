import React from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { GripVertical } from 'lucide-react';

interface DraggableCardProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

const DraggableCard: React.FC<DraggableCardProps> = ({ id, children, className = '' }) => {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={id}
      id={id}
      dragListener={false}
      dragControls={controls}
      className={`relative group ${className}`}
      whileDrag={{ 
        scale: 1.02, 
        zIndex: 50,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}
      transition={{ duration: 0.2 }}
    >
      {/* Drag Handle */}
      <div
        onPointerDown={(e) => controls.start(e)}
        className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity"
      >
        <GripVertical className="w-4 h-4 text-white/50" />
      </div>
      
      {children}
    </Reorder.Item>
  );
};

export default DraggableCard;
