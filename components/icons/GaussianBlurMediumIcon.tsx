
import React from 'react';

export const GaussianBlurMediumIcon: React.FC<{ className?: string }> = ({ className = "h-12 w-12" }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="3" strokeOpacity="0.5" />
    <path d="M16 24C16 24 20 18 24 24C28 30 32 24 32 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.9"/>
    <path d="M18 30C18 30 22 26 26 30C30 34 34 30 34 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.6"/>
  </svg>
);
