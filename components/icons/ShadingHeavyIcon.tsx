
import React from 'react';

export const ShadingHeavyIcon: React.FC<{ className?: string }> = ({ className = "h-12 w-12" }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="3" />
    <path d="M12.5 35.5C18 30 25.5 22 28 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M14.5 40.5C21 34 29.5 25 32.5 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M20 42C26 36 33 28 36 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M26 42C31.5 36.5 37.5 29.5 40 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M32 40C37 35 41 30 42 26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);