import React from 'react';
import { Icon } from './Icon';

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'fa-sm', 
    md: 'fa-lg',
    lg: 'fa-2x',
  };
  return (
    <Icon name={`fas fa-circle-notch fa-spin ${sizeClasses[size]}`} className={className} />
  );
};
