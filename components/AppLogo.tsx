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
        <clipPath id="body-mask">
            <rect x="30" y="40" width="40" height="40" />
        </clipPath>
      </defs>
      
      <style>
        {`
          @keyframes matrix-rain {
            0% { transform: translateY(-20px); opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { transform: translateY(50px); opacity: 0; }
          }
          .rain-drop {
            animation: matrix-rain linear infinite;
          }
        `}
      </style>

      {/* Base/Anvil Structure */}
      <path 
        d="M20 80 L80 80 L90 90 H10 L20 80Z" 
        stroke="#22d3ee" 
        strokeWidth="2" 
        fill="rgba(34, 211, 238, 0.1)"
      />
      
      {/* Animated Matrix Rain in Body */}
      <g clipPath="url(#body-mask)">
         {/* Primary Green Drops */}
         <rect x="35" y="40" width="2" height="10" fill="#22c55e" className="rain-drop" style={{ animationDuration: '1.5s', animationDelay: '0s' }} opacity="0.6" />
         <rect x="55" y="35" width="2" height="12" fill="#22c55e" className="rain-drop" style={{ animationDuration: '1.8s', animationDelay: '0.2s' }} opacity="0.6" />
         
         {/* Secondary Cyan Drops */}
         <rect x="45" y="30" width="2" height="8" fill="#22d3ee" className="rain-drop" style={{ animationDuration: '2.1s', animationDelay: '0.5s' }} opacity="0.5" />
         <rect x="65" y="45" width="2" height="7" fill="#22d3ee" className="rain-drop" style={{ animationDuration: '1.2s', animationDelay: '0.8s' }} opacity="0.5" />
         
         {/* Fine Particles */}
         <rect x="40" y="35" width="1" height="5" fill="#22c55e" className="rain-drop" style={{ animationDuration: '2.5s', animationDelay: '1.2s' }} opacity="0.4" />
         <rect x="60" y="30" width="1" height="6" fill="#22d3ee" className="rain-drop" style={{ animationDuration: '2.3s', animationDelay: '0.9s' }} opacity="0.4" />
      </g>

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