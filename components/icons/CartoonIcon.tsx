
import React from 'react';

export const CartoonIcon: React.FC<{ className?: string }> = ({ className = "h-16 w-16" }) => (
  <svg 
    className={className}
    viewBox="0 0 64 64" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M16 32C16 40.8366 23.1634 48 32 48C40.8366 48 48 40.8366 48 32C48 23.1634 40.8366 16 32 16C23.1634 16 16 23.1634 16 32Z" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M26 28C26.5523 28 27 27.5523 27 27C27 26.4477 26.5523 26 26 26C25.4477 26 25 26.4477 25 27C25 27.5523 25.4477 28 26 28Z" fill="currentColor"/>
    <path d="M38 28C38.5523 28 39 27.5523 39 27C39 26.4477 38.5523 26 38 26C37.4477 26 37 26.4477 37 27C37 27.5523 37.4477 28 38 28Z" fill="currentColor"/>
    <path d="M26 38C26 38 28 42 32 42C36 42 38 38 38 38" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);