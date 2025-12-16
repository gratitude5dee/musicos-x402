import React from 'react';
import { Search, Bell, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface SearchHeaderProps {
  greeting: string;
  subtitle?: string;
  onAddClick?: () => void;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  greeting,
  subtitle,
  onAddClick
}) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-foreground">{greeting}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="w-48 pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center relative"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
            3
          </span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAddClick}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New
        </motion.button>
      </div>
    </div>
  );
};

export default SearchHeader;
