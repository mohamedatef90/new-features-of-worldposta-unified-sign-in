import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Icon } from './Icon';

interface SearchableSelectProps {
    id: string;
    label: string;
    options: { value: string; label: string; }[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    listHeight?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({ id, label, options, value, onChange, placeholder, listHeight = 'max-h-60' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const rootRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedOption = useMemo(() => options.find(o => o.value === value), [options, value]);

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

    useEffect(() => {
        if (isOpen) {
            setSearchTerm('');
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const filteredOptions = useMemo(() => {
        if (!searchTerm) return options;
        return options.filter(option =>
            option.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [options, searchTerm]);

    const handleOptionClick = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    const baseLabelClasses = 'block text-sm font-medium mb-1 text-[#293c51] dark:text-gray-300';
    const baseButtonClasses = `w-full px-3 py-2 text-left bg-white dark:bg-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#679a41] dark:focus:ring-emerald-400 focus:border-[#679a41] dark:focus:border-emerald-400 border-gray-300 dark:border-gray-600 dark:text-white flex justify-between items-center`;

    return (
        <div className="mb-4" ref={rootRef}>
            <label htmlFor={id} className={baseLabelClasses}>{label}</label>
            <div className="relative">
                <button
                    type="button"
                    id={id}
                    className={baseButtonClasses}
                    onClick={() => setIsOpen(!isOpen)}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                >
                    <span className={selectedOption ? 'text-black dark:text-white' : 'text-gray-400 dark:text-gray-500'}>
                        {selectedOption?.label || placeholder || 'Select an option'}
                    </span>
                    <Icon name={isOpen ? 'fas fa-chevron-up' : 'fas fa-chevron-down'} className="text-gray-400" />
                </button>
                {isOpen && (
                    <div className={`absolute z-20 mt-1 w-full bg-white dark:bg-slate-700 shadow-lg rounded-md border dark:border-gray-600`}>
                        <div className="p-2">
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search..."
                                className="w-full px-2 py-1 border rounded-md bg-gray-50 dark:bg-slate-800 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-[#679a41]"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <ul className={`overflow-y-auto ${listHeight}`} tabIndex={-1} role="listbox">
                            {filteredOptions.length > 0 ? filteredOptions.map(option => (
                                <li
                                    key={option.value}
                                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 ${value === option.value ? 'font-bold bg-gray-100 dark:bg-slate-600' : 'dark:text-gray-200'}`}
                                    onClick={() => handleOptionClick(option.value)}
                                    role="option"
                                    aria-selected={value === option.value}
                                >
                                    {option.label}
                                </li>
                            )) : (
                                <li className="px-3 py-2 text-sm text-center text-gray-500 dark:text-gray-400">No results found.</li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};
