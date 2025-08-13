import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-6 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 print:hidden">
      <div className="flex flex-col sm:flex-row justify-center sm:justify-end items-center text-sm text-gray-500 dark:text-gray-400">
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <Link to="/privacy-policy" className="hover:text-[#679a41] dark:hover:text-emerald-400 hover:underline">Privacy Policy</Link>
          <Link to="/terms-of-service" className="hover:text-[#679a41] dark:hover:text-emerald-400 hover:underline">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};
