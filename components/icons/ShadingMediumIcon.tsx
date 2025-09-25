
import React from 'react';

export const ShadingMediumIcon: React.FC<{ className?: string }> = ({ className = "h-12 w-12" }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
     <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="3" />
     <path d="M30 14L22 34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
     <path d="M34 18L26 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
     <path d="M38 24L30 42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
     <path d="M26 10L18 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);