
import React, { ReactNode } from "react";
import Header from "@/components/ui/header";

interface MainContentProps {
  children: ReactNode;
}

const MainContent = ({ children }: MainContentProps) => {
  return (
    <div className="min-h-screen flex flex-col w-full relative">
      {/* Header and content */}
      <Header />
      <div className="flex-grow p-6">
        {children}
      </div>
    </div>
  );
};

export default MainContent;
