import React from 'react';

interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, checked, onChange, label, disabled }) => (
  <label htmlFor={id} className={`flex items-center ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
    {label && <span className="mr-3 text-sm font-medium text-gray-900 dark:text-gray-300">{label}</span>}
    <div className="relative">
      <input 
        type="checkbox" 
        id={id} 
        className="sr-only" 
        checked={checked} 
        onChange={(e) => onChange(e.target.checked)} 
        disabled={disabled}
      />
      <div className={`block w-14 h-8 rounded-full transition-colors ${checked ? 'bg-[#679a41]' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
      <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`}></div>
    </div>
  </label>
);
