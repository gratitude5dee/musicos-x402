import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface NavItemProps {
  item: {
    name: string;
    path: string;
    icon: React.ComponentType<{ className?: string; isGlowing?: boolean; glowColor?: "highlight" | "accent" | "white" }>;
    hasSubmenu?: boolean;
    isNew?: boolean;
    submenuItems?: {
      name: string;
      path: string;
      icon: React.ComponentType<{ className?: string; isGlowing?: boolean; glowColor?: "highlight" | "accent" | "white" }>;
      isNew?: boolean;
    }[];
  };
  isActive: boolean;
  isSubMenuActive?: boolean;
  isCollapsed: boolean;
  submenuOpen: boolean;
  toggleSubmenu: (e: React.MouseEvent) => void;
}

const SidebarNavItem: React.FC<NavItemProps> = ({
  item,
  isActive,
  isSubMenuActive,
  isCollapsed,
  submenuOpen,
  toggleSubmenu,
}) => {
  // Create variants for the animated indicator
  const indicatorVariants = {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { duration: 0.3 } }
  };
  
  // Text animation variants
  const textVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { 
        delay: 0.05, 
        duration: 0.2 
      } 
    }
  };

  const [isHovered, setIsHovered] = React.useState(false);
  const navigate = useNavigate();

  if (!item.hasSubmenu) {
    const linkContent = (
      <div className={`
        flex items-center py-2.5 my-1 rounded-lg text-sm font-medium transition-all duration-200
        ${isActive 
          ? 'bg-gradient-to-r from-accent-primary/80 to-accent-primary/60 text-white shadow-[0_0_10px_rgba(255,107,0,0.3)]' 
          : 'text-blue-lightest hover:bg-blue-primary/30 hover:text-white'}
        ${isCollapsed ? 'px-2 justify-center' : 'px-3'}
      `}>
        <div className={`
          relative flex items-center justify-center
          ${isCollapsed ? 'w-full' : 'mr-3'}
          ${isActive ? 'text-white' : 'text-blue-lightest group-hover:text-white'}
        `}>
          <item.icon
            className={`h-5 w-5 transition-all duration-200
              ${isActive ? 'icon-glow-white' : ''}
              ${!isActive && 'group-hover:text-white'}
            `}
            isGlowing={isActive || isHovered}
            glowColor={isActive ? "white" : "highlight"}
          />

          {/* Subtle icon background effect */}
          <span className={`absolute inset-0 rounded-full -z-10 transition-all duration-200
            ${isActive ? 'bg-white/10' : 'bg-transparent group-hover:bg-white/5'}
          `}></span>
          {item.isNew && (
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
          )}
        </div>
        
        {!isCollapsed && (
          <motion.span
            initial="hidden"
            animate="visible"
            variants={textVariants}
            className="flex-1 text-[13px] font-medium text-shadow-sm text-left flex items-center gap-2"
          >
            {item.name}
            {item.isNew && (
              <Badge className="text-[10px] uppercase tracking-wide bg-emerald-500/20 border-emerald-400/40 text-emerald-200">
                New
              </Badge>
            )}
          </motion.span>
        )}
        
        {isActive && (
          <motion.div 
            layoutId="sidebar-indicator" 
            className={`absolute ${isCollapsed ? 'right-1.5' : 'right-3'} w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)]`} 
            initial="initial"
            animate="animate"
            variants={indicatorVariants}
          />
        )}
      </div>
    );

    if (isCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Link 
              to={item.path} 
              className="relative block group"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {linkContent}
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8} className="bg-blue-darker/95 backdrop-blur-md border-cyan-400/40 shadow-[0_0_20px_rgba(8,145,178,0.5)] text-white text-sm font-medium">
            {item.name}
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Link 
        to={item.path} 
        className="relative block group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {linkContent}
      </Link>
    );
  }
  
  const submenuContent = (
    <div className={`
      flex items-center py-2.5 my-1 rounded-lg text-sm font-medium transition-all duration-200
      ${isSubMenuActive 
        ? 'bg-gradient-to-r from-blue-primary/70 to-blue-lighter/30 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
        : 'text-blue-lightest hover:bg-blue-primary/30 hover:text-white'}
      ${isCollapsed ? 'px-2 justify-center' : 'px-3'}
    `}>
      <div className="flex items-center flex-1">
        <div className={`
          relative flex items-center justify-center
          ${isCollapsed ? 'w-full' : 'mr-3'}
          ${isSubMenuActive ? 'text-white' : 'text-blue-lightest group-hover:text-white'}
        `}>
          <item.icon 
            className={`h-5 w-5 transition-all duration-200
              ${isSubMenuActive ? 'icon-glow-white' : ''}
              ${!isSubMenuActive && 'group-hover:text-white'}
            `}
            isGlowing={isSubMenuActive || isHovered}
            glowColor={isSubMenuActive ? "white" : "highlight"}
          />
          
          {/* Subtle icon background effect */}
          <span className={`absolute inset-0 rounded-full -z-10 transition-all duration-200
            ${isSubMenuActive ? 'bg-white/10' : 'bg-transparent group-hover:bg-white/5'}
          `}></span>
        </div>
        
        {!isCollapsed && (
          <motion.span
            initial="hidden"
            animate="visible"
            variants={textVariants}
            className="text-[13px] font-medium text-shadow-sm text-left"
          >
            {item.name}
          </motion.span>
        )}
      </div>
      
      {!isCollapsed && (
        <ChevronRight 
          className={`h-3.5 w-3.5 transition-transform duration-200 ${submenuOpen ? 'rotate-90' : ''} 
            ${isSubMenuActive ? 'text-white' : 'text-blue-lightest group-hover:text-white'}
          `} 
        />
      )}
      
      {isSubMenuActive && (
        <motion.div 
          layoutId="sidebar-indicator" 
          className={`absolute ${isCollapsed ? 'right-1.5' : 'right-3'} w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_5px_rgba(255,255,178,0.8)]`} 
          initial="initial"
          animate="animate" 
          variants={indicatorVariants}
        />
      )}
    </div>
  );

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <a 
            href="#" 
            onClick={toggleSubmenu}
            onDoubleClick={(e) => {
              e.preventDefault();
              if (item.name === "WZRD.tech") {
                navigate("/home");
              } else if (item.name === "Agents + Integrations") {
                navigate("/agents-integrations");
              } else if (item.name === "Marketing & Distribution") {
                navigate("/marketing-distribution");
              }
            }}
            className="relative block group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {submenuContent}
          </a>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8} className="bg-blue-darker/95 backdrop-blur-md border-cyan-400/40 shadow-[0_0_20px_rgba(8,145,178,0.5)] text-white text-sm font-medium">
          {item.name}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <a 
      href="#" 
      onClick={toggleSubmenu}
      onDoubleClick={(e) => {
        e.preventDefault();
        if (item.name === "WZRD.tech") {
          navigate("/home");
        } else if (item.name === "Agents + Integrations") {
          navigate("/agents-integrations");
        } else if (item.name === "Marketing & Distribution") {
          navigate("/marketing-distribution");
        }
      }}
      className="relative block group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {submenuContent}
    </a>
  );
};

export default SidebarNavItem;
