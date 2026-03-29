import React from 'react';

const Logo = ({ className = '', iconSize = 42, variant = 'full' }) => {
  return (
    <div className={`flex items-center space-x-3 select-none ${className}`}>
      {/* Precision Geometric EV Software Shield */}
      <svg 
        width={iconSize} 
        height={iconSize} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Outer Tech Hexagon */}
        <path 
          d="M 50 8 L 88 28 L 88 72 L 50 92 L 12 72 L 12 28 Z" 
          stroke="#1d1d1f" 
          strokeWidth="7" 
          strokeLinejoin="round" 
        />
        
        {/* Abstract Software Power Core (Inner Square offset) */}
        <rect x="30" y="30" width="40" height="40" fill="#f5f5f7" rx="8" />

        {/* Razor-sharp Electric Lightning Bolt */}
        <path 
          d="M 54 20 L 32 54 h 18 l -6 28 L 74 44 H 54 l 4 -24 Z" 
          fill="currentColor" 
          className="text-primary drop-shadow-[0_4px_12px_rgba(34,197,89,0.35)]" 
        />
      </svg>
      
      {/* Apple-style Premium Typography */}
      {variant === 'full' && (
        <div className="flex flex-col justify-center">
          <div className="text-[22px] font-black tracking-[-0.03em] text-[#1d1d1f] leading-none uppercase flex items-center">
            BAFNA <span className="text-gray-200 font-light mx-2">|</span> <span className="text-primary ml-0.5">E-BYKES</span>
          </div>
          <div className="text-[9px] font-bold text-gray-400 tracking-[0.25em] mt-1 ml-0.5">
            INTELLIGENT E-MOBILITY
          </div>
        </div>
      )}
    </div>
  );
};

export default Logo;
