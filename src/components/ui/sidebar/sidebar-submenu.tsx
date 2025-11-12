import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface SubmenuProps {
  isOpen: boolean;
  isCollapsed: boolean;
  submenuItems: {
    name: string;
    path: string;
    icon: React.ComponentType<{ className?: string; isGlowing?: boolean; glowColor?: "highlight" | "accent" | "white" }>;
    hasSubmenu?: boolean;
    isNew?: boolean;
    submenuItems?: {
      name: string;
      path: string;
      icon: React.ComponentType<{ className?: string; isGlowing?: boolean; glowColor?: "highlight" | "accent" | "white" }>;
    }[];
  }[];
  currentPath: string;
  currentTab?: string | null;
  parentName: string;
}

const SidebarSubmenu: React.FC<SubmenuProps> = ({
  isOpen,
  isCollapsed,
  submenuItems,
  currentPath,
  currentTab,
  parentName,
}) => {
  const [nestedOpenSubmenus, setNestedOpenSubmenus] = React.useState<{[key: string]: boolean}>({});

  const toggleNestedSubmenu = (name: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setNestedOpenSubmenus(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };
  if (!submenuItems.length) return null;

  // Animation variants for menu items
  const menuItemVariants = {
    hidden: { opacity: 0, y: -5 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.03 * i,
        duration: 0.2,
      }
    }),
    exit: { opacity: 0, y: -5, transition: { duration: 0.1 } }
  };

  // Submenu that appears on hover when sidebar is collapsed
  if (isCollapsed) {
    return (
      <div className="absolute left-full top-0 ml-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <motion.div 
          className="bg-gradient-to-br from-blue-darker/90 to-blue-dark/90 backdrop-blur-md p-3 min-w-48 border border-blue-primary/30 rounded-lg shadow-[0_0_20px_rgba(30,64,175,0.3)]"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="text-xs font-medium text-cyan-400 text-glow-cyan mb-2 px-2 uppercase tracking-wider">
            {parentName}
          </div>
          <div className="space-y-1">
            {submenuItems.map((subItem, index) => {
              const basePathMatch = currentPath.startsWith(subItem.path.split("?")[0]);
              const queryMatch = subItem.path.includes(`tab=${currentTab}`);
              
              const isSubItemActive = basePathMatch && 
                (!subItem.path.includes("?tab=") || (currentTab && queryMatch));

              if (subItem.hasSubmenu) {
                // Handle nested submenu for collapsed state
                return (
                  <motion.div
                    key={subItem.name}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={menuItemVariants}
                    className="relative"
                  >
                    <div
                      className={`
                        flex items-center px-3 py-2 rounded-lg text-xs transition-all duration-200 cursor-pointer
                        ${nestedOpenSubmenus[subItem.name] ? 'bg-cyan-500/20 text-white font-medium' : 'text-blue-lightest hover:bg-cyan-500/10 hover:text-white'}
                      `}
                      onClick={(e) => toggleNestedSubmenu(subItem.name, e)}
                    >
                      <subItem.icon
                        className={`h-3.5 w-3.5 mr-2 ${nestedOpenSubmenus[subItem.name] ? 'text-cyan-400 icon-glow-cyan' : 'text-blue-lighter'}`}
                        isGlowing={nestedOpenSubmenus[subItem.name]}
                        glowColor="highlight"
                      />
                      <span className="text-shadow-sm flex-1 flex items-center gap-2">
                        {subItem.name}
                        {subItem.isNew && (
                          <Badge className="text-[9px] uppercase tracking-wider bg-emerald-500/20 border-emerald-400/40 text-emerald-200">
                            New
                          </Badge>
                        )}
                      </span>
                      <ChevronRight className={`h-3 w-3 transition-transform duration-200 ${nestedOpenSubmenus[subItem.name] ? 'rotate-90' : ''}`} />
                    </div>
                    {nestedOpenSubmenus[subItem.name] && subItem.submenuItems && (
                      <div className="ml-6 mt-1 space-y-1">
                        {subItem.submenuItems.map((nestedItem, nestedIndex) => {
                          const nestedBasePathMatch = currentPath.startsWith(nestedItem.path.split("?")[0]);
                          const nestedQueryMatch = nestedItem.path.includes(`tab=${currentTab}`);
                          const isNestedActive = nestedBasePathMatch && 
                            (!nestedItem.path.includes("?tab=") || (currentTab && nestedQueryMatch));

                          const isExternalLink = nestedItem.path.startsWith('http');
                          
                          if (isExternalLink) {
                            return (
                              <a 
                                key={nestedItem.name}
                                href={nestedItem.path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`
                                  flex items-center px-3 py-2 rounded-lg text-xs transition-all duration-200
                                  text-blue-lightest hover:bg-cyan-500/10 hover:text-white
                                `}
                              >
                                <nestedItem.icon 
                                  className="h-3 w-3 mr-2 text-blue-lighter"
                                />
                                <span className="text-shadow-sm">{nestedItem.name}</span>
                              </a>
                            );
                          }

                          return (
                            <Link 
                              key={nestedItem.name}
                              to={nestedItem.path} 
                              className={`
                                flex items-center px-3 py-2 rounded-lg text-xs transition-all duration-200
                                ${isNestedActive 
                                  ? 'bg-cyan-500/30 text-white font-medium' 
                                  : 'text-blue-lightest hover:bg-cyan-500/10 hover:text-white'}
                              `}
                            >
                              <nestedItem.icon 
                                className={`h-3 w-3 mr-2 ${isNestedActive ? 'text-cyan-400 icon-glow-cyan' : 'text-blue-lighter'}`}
                                isGlowing={isNestedActive}
                                glowColor="highlight" 
                              />
                              <span className="text-shadow-sm">{nestedItem.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                );
              }
              
              return (
                <motion.div
                  key={subItem.name}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={menuItemVariants}
                >
                  {subItem.path.startsWith('http') ? (
                    <a
                      href={subItem.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`
                        flex items-center px-3 py-2 rounded-lg text-xs transition-all duration-200
                        text-blue-lightest hover:bg-cyan-500/10 hover:text-white
                      `}
                    >
                      <subItem.icon
                        className="h-3.5 w-3.5 mr-2 text-blue-lighter"
                      />
                      <span className="text-shadow-sm flex items-center gap-2">
                        {subItem.name}
                        {subItem.isNew && (
                          <Badge className="text-[9px] uppercase tracking-wider bg-emerald-500/20 border-emerald-400/40 text-emerald-200">
                            New
                          </Badge>
                        )}
                      </span>
                    </a>
                  ) : (
                    <Link
                      to={subItem.path}
                      className={`
                        flex items-center px-3 py-2 rounded-lg text-xs transition-all duration-200
                        ${isSubItemActive
                          ? 'bg-cyan-500/20 text-white font-medium'
                          : 'text-blue-lightest hover:bg-cyan-500/10 hover:text-white'}
                      `}
                    >
                      <subItem.icon
                        className={`h-3.5 w-3.5 mr-2 ${isSubItemActive ? 'text-cyan-400 icon-glow-cyan' : 'text-blue-lighter'}`}
                        isGlowing={isSubItemActive}
                        glowColor="highlight"
                      />
                      <span className="text-shadow-sm flex items-center gap-2">
                        {subItem.name}
                        {subItem.isNew && (
                          <Badge className="text-[9px] uppercase tracking-wider bg-emerald-500/20 border-emerald-400/40 text-emerald-200">
                            New
                          </Badge>
                        )}
                      </span>
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    );
  }

  // Expanded submenu animation for non-collapsed state
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
          animate={{ height: "auto", opacity: 1, overflow: 'visible' }}
          exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="mt-1 ml-4 space-y-1 overflow-hidden"
        >
          {submenuItems.map((subItem, index) => {
            const basePathMatch = currentPath.startsWith(subItem.path.split("?")[0]);
            const queryMatch = subItem.path.includes(`tab=${currentTab}`);
            
            const isSubItemActive = basePathMatch && 
              (!subItem.path.includes("?tab=") || (currentTab && queryMatch));

            if (subItem.hasSubmenu) {
              // Handle nested submenu for expanded state
              return (
                <motion.div
                  key={subItem.name}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={menuItemVariants}
                  className="space-y-1"
                >
                  <div 
                    className={`
                      flex items-center px-3 py-2 rounded-lg text-xs transition-all duration-200 relative group cursor-pointer
                      ${nestedOpenSubmenus[subItem.name] ? 'bg-cyan-500/20 text-white font-medium' : 'text-blue-lightest hover:bg-cyan-500/10 hover:text-white'}
                    `}
                    onClick={(e) => toggleNestedSubmenu(subItem.name, e)}
                  >
                    <subItem.icon 
                      className={`h-3.5 w-3.5 mr-2 ${nestedOpenSubmenus[subItem.name] ? 'text-cyan-400 icon-glow-cyan' : 'text-blue-lighter group-hover:text-blue-lightest'}`} 
                      isGlowing={nestedOpenSubmenus[subItem.name]} 
                      glowColor="highlight"
                    />
                    <span className="text-shadow-sm flex-1 text-left flex items-center gap-2">
                      {subItem.name}
                      {subItem.isNew && (
                        <Badge className="text-[9px] uppercase tracking-wider bg-emerald-500/20 border-emerald-400/40 text-emerald-200">
                          New
                        </Badge>
                      )}
                    </span>
                    <ChevronRight className={`h-3 w-3 transition-transform duration-200 ${nestedOpenSubmenus[subItem.name] ? 'rotate-90' : ''}`} />
                  </div>
                  <AnimatePresence>
                    {nestedOpenSubmenus[subItem.name] && subItem.submenuItems && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                        animate={{ height: "auto", opacity: 1, overflow: 'visible' }}
                        exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="ml-6 space-y-1"
                      >
                        {subItem.submenuItems.map((nestedItem, nestedIndex) => {
                          const nestedBasePathMatch = currentPath.startsWith(nestedItem.path.split("?")[0]);
                          const nestedQueryMatch = nestedItem.path.includes(`tab=${currentTab}`);
                          const isNestedActive = nestedBasePathMatch && 
                            (!nestedItem.path.includes("?tab=") || (currentTab && nestedQueryMatch));

                          return (
                            <motion.div
                              key={nestedItem.name}
                              custom={nestedIndex}
                              initial="hidden"
                              animate="visible"
                              variants={menuItemVariants}
                            >
                              {nestedItem.path.startsWith('http') ? (
                                <a 
                                  href={nestedItem.path}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`
                                    flex items-center px-3 py-2 rounded-lg text-xs transition-all duration-200 relative group
                                    text-blue-lightest hover:bg-cyan-500/10 hover:text-white
                                  `}
                                >
                                  <nestedItem.icon 
                                    className="h-3 w-3 mr-2 text-blue-lighter group-hover:text-blue-lightest" 
                                  />
                                  <span className="text-shadow-sm">{nestedItem.name}</span>
                                </a>
                              ) : (
                                <Link 
                                  to={nestedItem.path} 
                                  className={`
                                    flex items-center px-3 py-2 rounded-lg text-xs transition-all duration-200 relative group
                                    ${isNestedActive 
                                      ? 'bg-cyan-500/30 text-white font-medium' 
                                      : 'text-blue-lightest hover:bg-cyan-500/10 hover:text-white'}
                                  `}
                                >
                                  <nestedItem.icon 
                                    className={`h-3 w-3 mr-2 ${isNestedActive ? 'text-cyan-400 icon-glow-cyan' : 'text-blue-lighter group-hover:text-blue-lightest'}`} 
                                    isGlowing={isNestedActive} 
                                    glowColor="highlight"
                                  />
                                  <span className="text-shadow-sm">{nestedItem.name}</span>
                                  
                                  {/* Subtle active indicator */}
                                  {isNestedActive && (
                                    <span className="absolute right-1 w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_5px_rgba(0,240,255,0.5)]"></span>
                                  )}
                                </Link>
                              )}
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            }
            
            return (
              <motion.div
                key={subItem.name}
                custom={index}
                initial="hidden"
                animate="visible"
                variants={menuItemVariants}
              >
                {subItem.path.startsWith('http') ? (
                  <a 
                    href={subItem.path}
                    className={`
                      flex items-center px-3 py-2 rounded-lg text-xs transition-all duration-200 relative group
                      text-blue-lightest hover:bg-cyan-500/10 hover:text-white
                    `}
                  >
                    <subItem.icon 
                      className="h-3.5 w-3.5 mr-2 text-blue-lighter group-hover:text-blue-lightest" 
                    />
                    <span className="text-shadow-sm flex items-center gap-2">
                      {subItem.name}
                      {subItem.isNew && (
                        <Badge className="text-[9px] uppercase tracking-wider bg-emerald-500/20 border-emerald-400/40 text-emerald-200">
                          New
                        </Badge>
                      )}
                    </span>
                  </a>
                ) : (
                  <Link 
                    to={subItem.path} 
                    className={`
                      flex items-center px-3 py-2 rounded-lg text-xs transition-all duration-200 relative group
                      ${isSubItemActive 
                        ? 'bg-cyan-500/20 text-white font-medium' 
                        : 'text-blue-lightest hover:bg-cyan-500/10 hover:text-white'}
                    `}
                  >
                    <subItem.icon
                      className={`h-3.5 w-3.5 mr-2 ${isSubItemActive ? 'text-cyan-400 icon-glow-cyan' : 'text-blue-lighter group-hover:text-blue-lightest'}`}
                      isGlowing={isSubItemActive}
                      glowColor="highlight"
                    />
                    <span className="text-shadow-sm flex items-center gap-2">
                      {subItem.name}
                      {subItem.isNew && (
                        <Badge className="text-[9px] uppercase tracking-wider bg-emerald-500/20 border-emerald-400/40 text-emerald-200">
                          New
                        </Badge>
                      )}
                    </span>
                    
                    {/* Subtle active indicator */}
                    {isSubItemActive && (
                      <span className="absolute right-1 w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_5px_rgba(0,240,255,0.5)]"></span>
                    )}
                  </Link>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SidebarSubmenu;