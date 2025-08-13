import React from 'react';
import { Icon } from './Icon';
import { Spinner } from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIconName?: string;
  leftIconClassName?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ children, variant = 'primary', size = 'md', isLoading = false, fullWidth = false, className, leftIconName, leftIconClassName, ...props }, ref) => {
  const baseStyles = "font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-gray-800 transition-colors duration-150 ease-in-out inline-flex items-center justify-center";
  const variantStyles = {
    primary: "bg-[#679a41] text-white hover:bg-[#588836] focus:ring-[#679a41] dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:focus:ring-emerald-500",
    secondary: "bg-[#293c51] text-white hover:bg-[#1f2d3d] focus:ring-[#293c51] dark:bg-sky-600 dark:hover:bg-sky-700 dark:focus:ring-sky-600",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-500",
    outline: "bg-transparent text-[#679a41] border border-[#679a41] hover:bg-[#679a41]/10 focus:ring-[#679a41] dark:text-emerald-400 dark:border-emerald-400 dark:hover:bg-emerald-400/10",
    ghost: "bg-transparent text-[#293c51] hover:bg-gray-100 focus:ring-[#679a41] dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-emerald-400",
    dark: "bg-[#1F2937] text-gray-300 hover:bg-[#374151] focus:ring-[#1F2937] border border-[#374151]"
  };
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs h-8",
    md: "px-4 py-2 text-sm h-10",
    lg: "px-6 py-3 text-base h-12",
    icon: "p-2",
  };
  const widthStyles = fullWidth ? "w-full" : "";

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${isLoading || props.disabled ? 'opacity-75 cursor-not-allowed' : ''} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <Spinner size="sm" />
          <span className="ml-2">Loading...</span>
        </div>
      ) : (
        <>
        {leftIconName && <Icon name={leftIconName} className={`${children ? 'mr-2' : ''} ${leftIconClassName || ''}`} />}
        {children}
        </>
      )}
    </button>
  );
});