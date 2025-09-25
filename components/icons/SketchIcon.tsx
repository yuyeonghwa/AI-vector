
import React from 'react';

export const SketchIcon: React.FC<{ className?: string }> = ({ className = "h-16 w-16" }) => (
  <svg 
    className={className}
    viewBox="0 0 64 64" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M34.1316 16.2023L47.7977 29.8684L33.8684 43.7977L16 48L20.2023 30.1316L34.1316 16.2023Z" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M42.2023 24.269L40 26.4713" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M30.1316 20.2023L43.7977 33.8684" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 48L20.2023 43.7977" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);