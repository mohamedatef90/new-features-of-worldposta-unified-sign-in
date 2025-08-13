import React from 'react';

export const Tooltip: React.FC<{ text: string; children: React.ReactNode; className?: string }> = ({ text, children, className }) => {
  return (
    <div className={`relative flex items-center group ${className}`}>
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white bg-gray-900 dark:bg-black rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
        {text}
      </div>
    </div>
  );
};
