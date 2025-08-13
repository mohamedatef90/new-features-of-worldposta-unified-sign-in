import React from 'react';

interface IconProps {
  name: string;
  className?: string;
  ariaHidden?: boolean;
  ariaLabel?: string;
  fixedWidth?: boolean;
  style?: React.CSSProperties;
}
export const Icon: React.FC<IconProps> = ({ name, className, ariaHidden = true, ariaLabel, fixedWidth, style }) => (
  <i className={`${name} ${fixedWidth ? 'fa-fw' : ''} ${className || ''}`} aria-hidden={ariaHidden} {...(ariaLabel && {'aria-label': ariaLabel})} style={style}></i>
);
