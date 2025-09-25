
import React from 'react';

export const BlackAndWhiteIcon: React.FC<{ className?: string }> = ({ className = "h-16 w-16" }) => (
  <svg
    className={className}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M32 56C45.2548 56 56 45.2548 56 32C56 18.7452 45.2548 8 32 8C18.7452 8 8 18.7452 8 32C8 45.2548 18.7452 56 32 56Z" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M32 8C18.7452 8 8 18.7452 8 32C8 45.2548 18.7452 56 32 56V8Z" fill="currentColor"/>
  </svg>
);
