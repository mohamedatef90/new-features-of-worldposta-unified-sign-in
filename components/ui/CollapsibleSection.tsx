import React, { useState } from 'react';
import { Icon } from './Icon';

interface CollapsibleSectionProps {
  title?: string;
  children: React.ReactNode;
  initialOpen?: boolean;
  className?: string;
  maxItemsToShow?: number;
  items?: string[]; 
  itemClassName?: string; 
  seeMoreLinkClassName?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
    title, children, initialOpen = false, className, maxItemsToShow, items, itemClassName = "text-sm text-gray-600 dark:text-gray-400", seeMoreLinkClassName = "text-xs text-[#679a41] dark:text-emerald-400 hover:underline mt-1"
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [showAllItems, setShowAllItems] = useState(false);

  const renderContent = () => {
    if (items && maxItemsToShow && items.length > maxItemsToShow) {
      const visibleItems = showAllItems ? items : items.slice(0, maxItemsToShow);
      return (
        <>
          <ul className="list-disc list-inside space-y-1">
            {visibleItems.map((item, index) => <li key={index} className={itemClassName}>{item}</li>)}
          </ul>
          <button
            onClick={() => setShowAllItems(!showAllItems)}
            className={seeMoreLinkClassName}
          >
            {showAllItems ? `See ${items.length - maxItemsToShow} less features...` : `See ${items.length - maxItemsToShow} more features...`}
          </button>
        </>
      );
    }
    if(items && (!maxItemsToShow || items.length <= maxItemsToShow)) {
        return (
            <ul className="list-disc list-inside space-y-1">
                {items.map((item, index) => <li key={index} className={itemClassName}>{item}</li>)}
            </ul>
        );
    }
    return children;
  };

  if (!title) { 
    return <div className={className}>{renderContent()}</div>;
  }

  return (
    <div className={`py-2 ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left text-sm font-medium text-[#293c51] dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 p-2 rounded-md"
      >
        <span>{title}</span>
        <Icon name={isOpen ? "fas fa-chevron-up" : "fas fa-chevron-down"} className="w-4 h-4" />
      </button>
      {isOpen && <div className="mt-2 pl-2 border-l-2 border-gray-200 dark:border-slate-600 ml-2">
          {renderContent()}
        </div>}
    </div>
  );
};
