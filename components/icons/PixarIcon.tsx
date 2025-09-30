import React from 'react';

export const PixarIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 2a7 7 0 0 0-7 7c0 3.03 1.09 5.8 3 7.64V18a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-1.36c1.91-1.84 3-4.61 3-7.64a7 7 0 0 0-7-7z" />
    <path d="M10 21h4" />
  </svg>
);