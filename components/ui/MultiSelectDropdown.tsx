
import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { FormField } from './FormField';

interface MultiSelectOption {
    value: string;
    label: string;
}

interface MultiSelectDropdownProps {
    id: string;
    label: string;
    options: MultiSelectOption[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
    listHeight?: string;
    className?: string;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
    id,
    label,
    options,
    selected,
    onChange,
    placeholder = 'Select options...',
    listHeight = 'max-h-60',
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    const handleToggle = () => setIsOpen(!isOpen);

    const handleOptionToggle = (optionValue: string) => {
        const newSelected = selected.includes(optionValue)
            ? selected.filter(v => v !== optionValue)
            : [...selected, optionValue];
        onChange(newSelected);
    };

    const getDisplayValue = () => {
        if (selected.length === 0) {
            return <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>;
        }
        if (selected.length <= 3) {
            return selected.map(value => {
                const option = options.find(o => o.value === value);
                return (
                    <span key={value} className="bg-gray-200 dark:bg-slate-600 text-xs font-medium mr-1 px-2 py-1 rounded-full flex items-center">
                        {option?.label || value}
                        <button
                            type="button"
                            className="ml-2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white focus:outline-none"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOptionToggle(value);
                            }}
                        >
                            <Icon name="fas fa-times" className="h-3 w-3" />
                        </button>
                    </span>
                );
            });
        }
        return <span className="text-sm">{selected.length} items selected</span>;
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const baseLabelClasses = 'block text-sm font-medium mb-1 text-[#293c51] dark:text-gray-300';
    const baseButtonClasses = `w-full px-3 py-1 text-left bg-white dark:bg-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#679a41] dark:focus:ring-emerald-400 focus:border-[#679a41] dark:focus:border-emerald-400 border-gray-300 dark:border-gray-600 dark:text-white flex justify-between items-center min-h-[42px]`;

    return (
        <div className={`mb-4 ${className}`} ref={rootRef}>
            <label htmlFor={id} className={baseLabelClasses}>{label}</label>
            <div className="relative">
                <button
                    type="button"
                    id={id}
                    className={baseButtonClasses}
                    onClick={handleToggle}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                >
                    <div className="flex flex-wrap gap-1 items-center">
                        {getDisplayValue()}
                    </div>
                    <Icon name={isOpen ? 'fas fa-chevron-up' : 'fas fa-chevron-down'} className="text-gray-400 ml-2 flex-shrink-0" />
                </button>
                {isOpen && (
                    <div className={`absolute z-20 mt-1 w-full bg-white dark:bg-slate-700 shadow-lg rounded-md border dark:border-gray-600`}>
                        <ul className={`overflow-y-auto ${listHeight} p-2`} tabIndex={-1} role="listbox">
                            {options.length > 0 ? options.map(option => (
                                <li key={option.value} role="option" aria-selected={selected.includes(option.value)}>
                                    <FormField
                                        type="checkbox"
                                        id={`${id}-${option.value}`}
                                        name={option.label}
                                        label={option.label}
                                        checked={selected.includes(option.value)}
                                        onChange={() => handleOptionToggle(option.value)}
                                        wrapperClassName="mb-0 p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-600 w-full"
                                        labelClassName="w-full cursor-pointer"
                                    />
                                </li>
                            )) : (
                                <li className="px-3 py-2 text-sm text-center text-gray-500 dark:text-gray-400">No options available.</li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};
