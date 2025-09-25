
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 z-10">
      <div className="w-16 h-16 border-4 border-dark-border border-t-brand-blue rounded-full animate-spin"></div>
      <p className="mt-4 text-light-text font-semibold">아트를 생성 중입니다...</p>
    </div>
  );
};

export default Loader;