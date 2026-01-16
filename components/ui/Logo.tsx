import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <defs>
        <linearGradient id="gold-gradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FCD34D" />
          <stop offset="0.5" stopColor="#F59E0B" />
          <stop offset="1" stopColor="#B45309" />
        </linearGradient>
        <linearGradient id="star-gradient" x1="50" y1="20" x2="50" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff4d4d" />
          <stop offset="1" stopColor="#990000" />
        </linearGradient>
        <radialGradient id="center-glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(50 50) rotate(90) scale(20)">
          <stop stopColor="white" stopOpacity="0.9" />
          <stop offset="0.6" stopColor="#ef4444" stopOpacity="0.4" />
          <stop offset="1" stopColor="#ef4444" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ring-gradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0891b2" />
            <stop offset="1" stopColor="#164e63" />
        </linearGradient>
      </defs>

      {/* Outer Rim */}
      <circle cx="50" cy="50" r="48" fill="#0f172a" stroke="url(#gold-gradient)" strokeWidth="3" />
      
      {/* Inner Tech Background */}
      <circle cx="50" cy="50" r="42" fill="url(#ring-gradient)" stroke="#06b6d4" strokeWidth="1" strokeOpacity="0.5" />

      {/* Circuit Detail Ring */}
      <path d="M50 10 L 50 20" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
      <path d="M90 50 L 80 50" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
      <path d="M50 90 L 50 80" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 50 L 20 50" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
      
      {/* Circuit Traces */}
      <path d="M25 25 L 35 35" stroke="#22d3ee" strokeWidth="1" opacity="0.6" />
      <path d="M75 25 L 65 35" stroke="#22d3ee" strokeWidth="1" opacity="0.6" />
      <path d="M25 75 L 35 65" stroke="#22d3ee" strokeWidth="1" opacity="0.6" />
      <path d="M75 75 L 65 65" stroke="#22d3ee" strokeWidth="1" opacity="0.6" />
      
      {/* Star Shape */}
      <path 
        d="M50 15 L 61 38 L 86 41 L 67 59 L 72 84 L 50 72 L 28 84 L 33 59 L 14 41 L 39 38 Z" 
        fill="url(#star-gradient)" 
        stroke="#60a5fa" 
        strokeWidth="1.5"
        strokeLinejoin="round"
        className="drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]"
      />
      
      {/* Center Shine */}
      <circle cx="50" cy="50" r="8" fill="url(#center-glow)" />
    </svg>
  );
};
