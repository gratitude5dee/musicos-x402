
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
    <div className="min-h-screen bg-transparent relative">
      <CloudShader />
      <Sidebar navItems={navItems} />
      <div 
        className="relative min-h-screen w-full transition-all duration-300 z-10"
        style={{
          marginLeft: sidebarCollapsed ? '4rem' : '16rem'
        }}
      >
        <MainContent>{children}</MainContent>
      </div>
      <FuturisticCursor />
    </div>
  );
};

export default DashboardLayout;
