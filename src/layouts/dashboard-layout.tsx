
import React, { ReactNode, useState, useEffect } from "react";
import Sidebar from "@/components/ui/sidebar/sidebar";
import MainContent from "@/components/ui/layout/main-content";
import { navItems } from "@/components/ui/navigation/nav-items";
import { FuturisticCursor } from "@/components/ui/cursor";
import CloudShader from "@/components/ui/shaders/CloudShader";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Default to collapsed

  // Listen for sidebar state changes from localStorage
  useEffect(() => {
    const checkSidebarState = () => {
      const savedState = localStorage.getItem('sidebarCollapsed');
      if (savedState !== null) {
        setSidebarCollapsed(savedState === 'true');
      }
    };

    // Initial check
    checkSidebarState();

    // Listen for storage changes (when sidebar toggles)
    window.addEventListener('storage', checkSidebarState);
    
    // Also poll for changes since storage events don't fire in the same tab
    const interval = setInterval(checkSidebarState, 100);

    return () => {
      window.removeEventListener('storage', checkSidebarState);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      {/* Background shader - always behind everything */}
      <div className="fixed inset-0 z-0">
        <CloudShader />
      </div>
      
      {/* Content layer */}
      <div className="relative z-10">
        <Sidebar navItems={navItems} />
        <div 
          className="relative min-h-screen w-full transition-all duration-300"
          style={{
            marginLeft: sidebarCollapsed ? '4rem' : '16rem'
          }}
        >
          <MainContent>{children}</MainContent>
        </div>
      </div>
      
      <FuturisticCursor />
    </div>
  );
};

export default DashboardLayout;
