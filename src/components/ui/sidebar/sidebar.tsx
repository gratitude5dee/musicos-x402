
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SidebarContent from "./sidebar-content";
import { motion } from "framer-motion";
import CloudShader from "@/components/ui/shaders/CloudShader";

interface SidebarProps {
  navItems: {
    name: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    hasSubmenu?: boolean;
    submenuItems?: {
      name: string;
      path: string;
      icon: React.ComponentType<{ className?: string }>;
    }[];
  }[];
}

const Sidebar: React.FC<SidebarProps> = ({ navItems }) => {
  const [isCollapsed, setIsCollapsed] = useState(true); // Default to collapsed
  const [isHovered, setIsHovered] = useState(false);

  // Check for user preference in localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setIsCollapsed(savedState === 'true');
    }
    
    // Clean up old localStorage entries from previous implementation
    localStorage.removeItem('sidebarHidden');
    localStorage.removeItem('sidebarPinned');
  }, []);

  // Handle hover expand/collapse
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Toggle between collapsed (icons only) and expanded (icons + text)
  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
  };

  // Determine if sidebar should be expanded (either pinned open or hovered)
  const isExpanded = !isCollapsed || isHovered;

  return (
    <motion.aside 
      className="fixed left-0 top-0 h-screen flex flex-col border-r border-blue-primary/40 shadow-blue-glow transition-all duration-300 overflow-hidden z-30"
      initial={false}
      animate={{ 
        width: isExpanded ? '16rem' : '4.5rem'
      }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* CloudShader for sidebar background */}
      <div className="absolute inset-0 overflow-hidden">
        <CloudShader />
        {/* Overlay to make text more readable on shader background */}
        <div className="absolute inset-0 bg-blue-dark/70 z-1"></div>
      </div>

      <div className="p-5 h-full flex flex-col overflow-hidden relative z-10">
        <SidebarContent 
          navItems={navItems} 
          isCollapsed={!isExpanded} 
        />
      </div>
      
      {/* Optional pin/unpin button - only visible on hover */}
      {isHovered && (
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleSidebar} 
          className="absolute -right-3 top-24 h-10 w-10 rounded-full bg-gradient-to-r from-cyan-600 to-cyan-500 border border-cyan-400/40 hover:from-cyan-500 hover:to-cyan-400 text-white shadow-[0_0_15px_rgba(8,145,178,0.8)] z-20 flex items-center justify-center transition-all duration-200 backdrop-blur-sm animate-fade-in" 
          aria-label={isCollapsed ? "Pin sidebar open" : "Unpin sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      )}
    </motion.aside>
  );
};

export default Sidebar;
