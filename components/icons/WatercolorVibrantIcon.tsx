
import React from 'react';

export const WatercolorVibrantIcon: React.FC<{ className?: string }> = ({ className = "h-12 w-12" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2c-3.1 0-5 2.5-5 5s2.5 7 5 7 5-4 5-7-2-5-5-5z" fill="currentColor" opacity="0.6"/>
    <path d="M6 10c-3 0-4 3-2 5s5 2 5 0-1-5-3-5z" fill="currentColor" opacity="0.8"/>
    <path d="M16 11c3 0 4 3 2 5s-5 2-5 0 1-5 3-5z" fill="currentColor" opacity="0.7"/>
  </svg>
);
