
import React, { ReactNode } from "react";
import Header from "@/components/ui/header";
import CloudShader from "@/components/ui/shaders/CloudShader";

interface MainContentProps {
  children: ReactNode;
}

const MainContent = ({ children }: MainContentProps) => {
  return (
    <div className="min-h-screen flex flex-col w-full relative bg-transparent">
      {/* Cloud GLSL Shader Background */}
      <div className="absolute inset-0 z-0">
        <CloudShader />
      </div>
      
      {/* Overlay to add slight darkening and better text contrast */}
      <div className="absolute inset-0 bg-blue-darker/20 z-1"></div>
      
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none z-2" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px'
        }} 
      />
      
      {/* Header and content are positioned above the background layers */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainContent;
