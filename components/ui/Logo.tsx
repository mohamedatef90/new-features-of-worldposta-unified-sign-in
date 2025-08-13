import React from 'react';
import { Link } from 'react-router-dom';

export const Logo: React.FC<{ className?: string, iconClassName?: string }> = ({ className, iconClassName = "h-6 w-auto" }) => (
  <Link to="/" className={`flex items-center ${className}`}>
    <img src="https://www.worldposta.com/assets/WP-Logo.png" alt="WorldPosta Logo" className={`${iconClassName}`} />
  </Link>
);
