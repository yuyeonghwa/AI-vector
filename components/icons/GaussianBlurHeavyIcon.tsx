
import React from 'react';

export const GaussianBlurHeavyIcon: React.FC<{ className?: string }> = ({ className = "h-12 w-12" }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="3" strokeOpacity="0.4" />
    <path d="M12 24C12 24 18 16 24 24C30 32 36 24 36 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M14 32C14 32 20 24 26 32C32 40 38 32 38 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7"/>
    <path d="M14 16C14 16 20 24 26 16C32 8 38 16 38 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7"/>
  </svg>
);
