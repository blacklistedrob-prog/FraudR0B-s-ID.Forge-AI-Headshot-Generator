import React from 'react';

const AppLogo = ({ className = "w-10 h-10" }: { className?: string }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      className={className} 
      fill="none"
    >
      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Base/Anvil Structure - Wireframe Style */}
      <path 
        d="M20 80 L80 80 L90 90 H10 L20 80Z" 
        stroke="#22d3ee" 
        strokeWidth="2" 
        fill="rgba(34, 211, 238, 0.1)"
      />
      <path 
        d="M30 80 L30 50 Q30 40 20 40 H15 V30 H85 V40 H80 Q70 40 70 50 L70 80" 
        stroke="#22d3ee" 
        strokeWidth="2" 
        fill="none"
      />
      
      {/* Camera Lens Assembly on Top */}
      <circle cx="50" cy="25" r="15" stroke="#22c55e" strokeWidth="2" fill="rgba(0,0,0,0.5)" filter="url(#glow)" />
      <circle cx="50" cy="25" r="8" stroke="#22c55e" strokeWidth="1" />
      <path d="M50 10 L50 15" stroke="#22c55e" strokeWidth="2" />
      <path d="M65 25 L60 25" stroke="#22c55e" strokeWidth="2" />
      <path d="M50 40 L50 35" stroke="#22c55e" strokeWidth="2" />
      <path d="M35 25 L40 25" stroke="#22c55e" strokeWidth="2" />
      
      {/* Matrix Rain / Forge Sparks */}
      <path d="M25 60 L25 65 M35 55 L35 62 M45 58 L45 64" stroke="#22d3ee" strokeWidth="1" opacity="0.5" />
      
      {/* Initials F R */}
      <text 
        x="38" 
        y="70" 
        fontFamily="monospace" 
        fontWeight="bold" 
        fontSize="16" 
        fill="#22d3ee"
        style={{ textShadow: '0 0 5px #22d3ee' }}
      >
        F
      </text>
      <text 
        x="52" 
        y="70" 
        fontFamily="monospace" 
        fontWeight="bold" 
        fontSize="16" 
        fill="#22c55e"
        style={{ textShadow: '0 0 5px #22c55e' }}
      >
        R
      </text>

      {/* Connection Lines */}
      <line x1="50" y1="40" x2="50" y2="50" stroke="#22d3ee" strokeWidth="1" strokeDasharray="2 2" />
      
    </svg>
  );
};

export default AppLogo;