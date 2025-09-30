import React from 'react';

export const GhibliIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 22v-6" />
    <path d="M12 16a6 6 0 0 0 6-6V8" />
    <path d="M12 16a6 6 0 0 1-6-6V8" />
    <path d="M15 5a3 3 0 1 0-6 0" />
  </svg>
);