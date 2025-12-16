import React from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useThirdwebAuth } from "@/context/ThirdwebAuthContext";
import { WalletInfo } from "./WalletInfo";
import { WalletDropdown } from "@/components/wallet/WalletDropdown";
import { Settings } from "./Settings";
import logo from "@/assets/universal-ai-logo.png";

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useThirdwebAuth();

  // Get the current page title based on the route
  const getPageTitle = () => {
    const path = location.pathname;

    // Extract the last part of the path
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) return "Dashboard";
    const lastPart = parts[parts.length - 1];

    // Convert kebab-case to Title Case
    return lastPart.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  
  return (
    <motion.header 
      className="px-4 py-2 flex items-center justify-between bg-transparent z-10" 
      initial={{
        opacity: 0,
        y: -20
      }} 
      animate={{
        opacity: 1,
        y: 0
      }} 
      transition={{
        duration: 0.3
      }}
    >
      <div className="flex items-center">
        <Link 
          to="/" 
          className="flex items-center mr-4"
          onDoubleClick={(e) => {
            e.preventDefault();
            navigate("/home");
          }}
        >
          <img 
            src={logo} 
            alt="UniversalAI Logo" 
            className="h-10 w-auto object-contain"
          />
        </Link>
        
        <div className="text-lg font-medium">{getPageTitle()}</div>
      </div>
      
      <div className="flex items-center space-x-3">
        <WalletDropdown />
        {isAuthenticated && <WalletInfo />}
        <Settings />
      </div>
    </motion.header>
  );
};

export default Header;
