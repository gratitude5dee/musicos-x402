
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./FuturisticCursor.css";

interface FuturisticCursorProps {
  isLoading?: boolean;
}

const FuturisticCursor: React.FC<FuturisticCursorProps> = ({ 
  isLoading = false 
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const cursorRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Set initial visibility
    setIsVisible(true);
    
    // Cursor movement handler with optimization using requestAnimationFrame
    let rafId: number;
    let lastX = 0;
    let lastY = 0;
    
    const handleMouseMove = (e: MouseEvent) => {
      // Cancel any pending animation frame
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      
      // Schedule the position update
      rafId = requestAnimationFrame(() => {
        // Only update if position actually changed significantly
        if (Math.abs(e.clientX - lastX) > 0.5 || Math.abs(e.clientY - lastY) > 0.5) {
          lastX = e.clientX;
          lastY = e.clientY;
          setPosition({ x: e.clientX, y: e.clientY });
        }
        
        // Check if hovering over interactive element
        const targetElement = document.elementFromPoint(e.clientX, e.clientY);
        
        // Skip hover effect on inputs and text areas
        const isInput = targetElement?.tagName === "INPUT" || 
                       targetElement?.tagName === "TEXTAREA" ||
                       targetElement?.tagName === "SELECT" ||
                       targetElement?.hasAttribute("contenteditable");
        
        if (isInput) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
          const isInteractive = targetElement?.closest('.cursor-interactive') != null || 
                               targetElement?.tagName === "BUTTON" || 
                               targetElement?.tagName === "A" ||
                               targetElement?.closest('button') != null ||
                               targetElement?.closest('a') != null;
          
          setIsHovering(isInteractive);
        }
      });
    };

    const handleMouseDown = () => {
      if (isHovering) {
        setIsActive(true);
        // Create particles on click
        if (particlesRef.current) {
          const particleElements = particlesRef.current.children;
          for (let i = 0; i < particleElements.length; i++) {
            const particle = particleElements[i] as HTMLElement;
            // Reset animation
            particle.style.animation = 'none';
            void particle.offsetWidth; // Trigger reflow
            particle.style.animation = '';
          }
        }
      }
    };

    const handleMouseUp = () => {
      setIsActive(false);
    };

    // Hide cursor when it leaves the window
    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    // Apply global cursor style
    document.documentElement.classList.add('custom-cursor');

    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      // Clean up event listeners
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      
      // Reset cursor style
      document.documentElement.classList.remove('custom-cursor');
    };
  }, [isHovering]);

  // Determine cursor classes based on state
  const cursorClasses = [
    'futuristic-cursor',
    isLoading ? 'loading' : '',
    isActive ? 'active' : '',
    isHovering && !isActive && !isLoading ? 'hovering' : '',
    !isVisible ? 'hidden' : '',
  ].filter(Boolean).join(' ');

  return createPortal(
    <div
      ref={cursorRef}
      className={cursorClasses}
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="cursor-ring"></div>
      <div className="cursor-dot"></div>
      {isHovering && (
        <div className="cursor-target">
          <div className="target-bracket left"></div>
          <div className="target-bracket right"></div>
        </div>
      )}
      {isLoading && (
        <div className="cursor-loading">
          <div className="loading-dot dot1"></div>
          <div className="loading-dot dot2"></div>
          <div className="loading-dot dot3"></div>
        </div>
      )}
      <div ref={particlesRef} className="cursor-particles">
        <div className="particle p1"></div>
        <div className="particle p2"></div>
        <div className="particle p3"></div>
        <div className="particle p4"></div>
      </div>
    </div>,
    document.body
  );
};

export default FuturisticCursor;
