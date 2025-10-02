
import React from 'react';

export const WatercolorIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12.25 21.75a1.5 1.5 0 0 0 1.5-1.5v-6.52a1.5 1.5 0 0 0-.54-1.15l-4.96-5.48A1.5 1.5 0 0 1 8.5 4.5v-1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1a1.5 1.5 0 0 1-.75 1.32l-4.96 5.48a1.5 1.5 0 0 0-.54 1.15v6.52a1.5 1.5 0 0 0 1.5 1.5z"/>
    <path d="M7.5 18c-2.5 0-2.5-4-1-5.5s4-1.5 4 0-1.5 5.5-4 5.5z"/>
  </svg>
);
