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
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="currentColor" stopOpacity="1" />
          <stop offset="0.5" stopColor="currentColor" stopOpacity="0.75" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Precision grid lines in background */}
      <rect x="10" y="10" width="80" height="80" rx="16" stroke="currentColor" strokeWidth="2" strokeDasharray="4 6" opacity="0.15" />
      <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" opacity="0.15" />
      <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" opacity="0.15" />

      {/* Minimalist abstract geometric V & B construction */}
      {/* Left stem of the V */}
      <path 
        d="M28 32 L 47 70 L 53 70 L 34 32 Z" 
        fill="url(#logo-gradient)" 
      />
      {/* Right stem of the V / B structural loop back */}
      <path 
        d="M66 32 L 47 70 L 53 70 L 72 32 Z" 
        fill="currentColor"
        opacity="0.9"
      />
      {/* Precision alignment indicator dots */}
      <circle cx="50" cy="70" r="2.5" fill="currentColor" />
      <circle cx="28" cy="32" r="1.5" fill="currentColor" opacity="0.5" />
      <circle cx="72" cy="32" r="1.5" fill="currentColor" opacity="0.5" />
    </svg>
  );
};
