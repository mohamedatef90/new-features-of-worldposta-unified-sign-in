import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from './Icon';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={`mb-4 ${className}`}>
      <ol className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {item.path && index < items.length - 1 ? (
              <Link to={item.path} className="hover:text-[#679a41] dark:hover:text-emerald-400 hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className="text-[#293c51] dark:text-gray-200 font-medium">{item.label}</span>
            )}
            {index < items.length - 1 && (
              <Icon name="fas fa-chevron-right" className="w-4 h-4 mx-1 text-gray-400 dark:text-gray-500" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
