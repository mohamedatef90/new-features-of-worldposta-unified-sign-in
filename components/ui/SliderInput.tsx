import React from 'react';

interface SliderInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string; 
  pricePerUnit?: number;
  className?: string;
  disabled?: boolean;
}
export const SliderInput: React.FC<SliderInputProps> = ({ id, label, value, onChange, min, max, step, unit, pricePerUnit, className, disabled }) => {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let numValue = Number(e.target.value);
    if (numValue < min) numValue = min;
    if (numValue > max) numValue = max;
    onChange(numValue);
  };

  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-[#293c51] dark:text-gray-300 mb-1">
        {label} {unit && `(${unit})`}
        {pricePerUnit && <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(${pricePerUnit.toFixed(2)}/{unit || 'unit'})</span>}
      </label>
      <div className="flex items-center space-x-3">
        <input
          type="range"
          id={`${id}-slider`}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          disabled={disabled}
          className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#679a41] dark:accent-emerald-500"
        />
        <input
          type="number"
          id={id}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-[#679a41] dark:focus:ring-emerald-400 focus:border-[#679a41] dark:focus:border-emerald-400"
        />
      </div>
    </div>
  );
};
