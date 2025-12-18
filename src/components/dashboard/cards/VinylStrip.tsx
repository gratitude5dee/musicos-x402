'use client';

import { motion } from 'framer-motion';
import { Music } from 'lucide-react';

interface VinylItem {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
}

interface VinylStripProps {
  items: VinylItem[];
  onSelect?: (item: VinylItem) => void;
}

export function VinylStrip({ items, onSelect }: VinylStripProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
          whileHover={{ scale: 1.05, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect?.(item)}
          className="relative flex-shrink-0 snap-start cursor-pointer group"
        >
          {/* Vinyl Record */}
          <div className="relative w-16 h-16 md:w-20 md:h-20">
            {/* Record disc */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 shadow-lg group-hover:shadow-xl group-hover:shadow-primary/20 transition-shadow">
              {/* Grooves */}
              <div className="absolute inset-2 rounded-full border border-zinc-700/50" />
              <div className="absolute inset-3 rounded-full border border-zinc-700/30" />
              <div className="absolute inset-4 rounded-full border border-zinc-700/20" />
              
              {/* Center label */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full overflow-hidden bg-gradient-to-br from-primary/80 to-primary shadow-inner">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-3 h-3 md:w-4 md:h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Shine effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          
          {/* Title tooltip on hover */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            <span className="text-xs text-muted-foreground truncate max-w-20 block text-center">
              {item.title}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
