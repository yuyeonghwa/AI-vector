
import React from 'react';

export const GaussianBlurLightIcon: React.FC<{ className?: string }> = ({ className = "h-12 w-12" }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="3" strokeOpacity="0.5" />
    <path d="M16 24C16 24 20 20 24 24C28 28 32 24 32 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7"/>
  </svg>
);
