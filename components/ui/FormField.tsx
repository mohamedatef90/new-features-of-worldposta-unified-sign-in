
import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './Icon';

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  value?: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  as?: 'textarea' | 'select';
  disabled?: boolean;
  children?: React.ReactNode;
  inputClassName?: string;
  labelClassName?: string;
  showPasswordToggle?: boolean;
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
  hint?: React.ReactNode;
  name?: string;
  checked?: boolean;
  wrapperClassName?: string;
  maxLength?: number;
  indeterminate?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({ 
  id, label, type = "text", value, onChange, placeholder, error, required, as, disabled, children,
  inputClassName, labelClassName, showPasswordToggle, rows = 4, min, max, step, hint, name, checked, wrapperClassName, maxLength, indeterminate
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const effectiveType = showPasswordToggle && type === 'password' ? (isPasswordVisible ? 'text' : 'password') : type;
  const checkboxInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (type === 'checkbox' && checkboxInputRef.current) {
        checkboxInputRef.current.indeterminate = indeterminate || false;
    }
  }, [indeterminate, type]);

  const baseLabelClasses = `block text-sm font-medium mb-1 ${disabled ? 'text-gray-400 dark:text-gray-500' : 'text-[#293c51] dark:text-gray-300'}`;
  const baseInputClasses = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#679a41] dark:focus:ring-emerald-400 focus:border-[#679a41] dark:focus:border-emerald-400 ${error ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'} ${disabled ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-700 dark:text-white'} placeholder-gray-400 dark:placeholder-gray-500`;
  
  const inputElement = () => {
    if (as === 'textarea') {
      return (
        <textarea
          id={id}
          name={name || id}
          value={(value as string) ?? ''} 
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          maxLength={maxLength}
          className={`${baseInputClasses} ${inputClassName}`}
        />
      );
    } else if (as === 'select') {
      return (
        <select
          id={id}
          name={name || id}
          value={value ?? ''}
          onChange={onChange}
          disabled={disabled}
          className={`${baseInputClasses} ${inputClassName}`}
        >
          {children}
        </select>
      );
    } else if (type === 'checkbox') {
        const defaultCheckboxClasses = `h-4 w-4 text-[#679a41] rounded border-gray-300 dark:border-gray-600 focus:ring-[#679a41] dark:focus:ring-emerald-400`;
        return (
            <input
                ref={checkboxInputRef}
                type="checkbox"
                id={id}
                name={name || id}
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                className={`${inputClassName || defaultCheckboxClasses} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
            />
        );
    } else { 
      return (
        <input
          type={effectiveType}
          id={id}
          name={name || id}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          maxLength={maxLength}
          className={`${baseInputClasses} ${inputClassName} ${showPasswordToggle ? 'pr-10' : ''}`}
        />
      );
    }
  };

  if (type === 'checkbox') {
    return (
        <div className={`mb-4 flex items-center ${wrapperClassName || ''}`}>
            {inputElement()}
            {label && (
              <label htmlFor={id} className={`ml-2 text-sm ${disabled ? 'text-gray-400 dark:text-gray-500' : 'text-[#293c51] dark:text-gray-300'} ${labelClassName || ''}`}>
                  {label} {required && <span className="text-red-500 dark:text-red-400">*</span>}
              </label>
            )}
            {error && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>}
        </div>
    );
  }

  return (
    <div className="mb-4">
      <label htmlFor={id} className={`${baseLabelClasses} ${labelClassName || ''}`}>
        {label} {required && <span className="text-red-500 dark:text-red-400">*</span>}
      </label>
      <div className="relative">
        {inputElement()}
        {type === 'password' && showPasswordToggle && (
          <button
            type="button"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
          >
            <Icon name={isPasswordVisible ? "fas fa-eye-slash" : "fas fa-eye"} className="w-5 h-5" />
          </button>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
};
