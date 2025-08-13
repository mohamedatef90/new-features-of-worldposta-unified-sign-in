import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './Icon';
import { Tooltip } from './Tooltip';

interface ActionItem {
  label: string;
  icon: string;
  onClick: () => void;
}

interface FloatingActionMenuProps {
  actions: ActionItem[];
}

export const FloatingActionMenu: React.FC<FloatingActionMenuProps> = ({ actions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="fixed bottom-24 right-6 z-40">
      <div className="relative flex flex-col items-center gap-3">
        {/* Action Items */}
        <div
          className={`transition-all duration-300 ease-in-out flex flex-col items-center gap-3 ${
            isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          {actions.map((action) => (
            <Tooltip key={action.label} text={action.label}>
              <button
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className="w-12 h-12 rounded-full bg-white dark:bg-slate-700 text-[#293c51] dark:text-gray-200 shadow-md hover:bg-gray-100 dark:hover:bg-slate-600 flex items-center justify-center transition-all"
                aria-label={action.label}
              >
                <Icon name={action.icon} className="text-xl" />
              </button>
            </Tooltip>
          ))}
        </div>
        {/* Main FAB */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-[#679a41] dark:bg-emerald-500 text-white shadow-lg hover:bg-[#588836] dark:hover:bg-emerald-600 flex items-center justify-center transition-transform duration-300 ease-in-out hover:scale-110"
          aria-haspopup="true"
          aria-expanded={isOpen}
          title="Quick Actions"
        >
          <Icon name="fas fa-plus" className={`text-2xl transition-all duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`} />
        </button>
      </div>
    </div>
  );
};