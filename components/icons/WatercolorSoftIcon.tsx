
import React from 'react';

export const WatercolorSoftIcon: React.FC<{ className?: string }> = ({ className = "h-12 w-12" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="soft-grad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" style={{stopColor: 'currentColor', stopOpacity: 0.4}} />
        <stop offset="100%" style={{stopColor: 'currentColor', stopOpacity: 0}} />
      </radialGradient>
    </defs>
    <circle cx="12" cy="12" r="10" fill="url(#soft-grad)" />
    <path d="M9 9c1.5-1 3.5-1.5 5 0s2.5 4 0 5c-2.5 1-4.5.5-5 0s-1.5-4 0-5z" fill="currentColor" opacity="0.2" />
  </svg>
);
