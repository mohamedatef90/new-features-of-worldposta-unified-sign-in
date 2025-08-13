import React, { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { Icon } from './Icon';
import { ToggleSwitch } from './ToggleSwitch';
import { Tooltip } from './Tooltip';

interface DashboardCard {
    id: string;
    name: string;
}

interface DashboardCustomizationMenuProps {
    allCards: DashboardCard[];
    visibility: { [key: string]: boolean };
    onVisibilityChange: (newVisibility: { [key: string]: boolean }) => void;
    isArrangeMode: boolean;
    onToggleArrangeMode: () => void;
}


export const DashboardCustomizationMenu: React.FC<DashboardCustomizationMenuProps> = ({
    allCards,
    visibility,
    onVisibilityChange,
    isArrangeMode,
    onToggleArrangeMode,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current && !menuRef.current.contains(event.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggleVisibility = (cardId: string) => {
        const newVisibility = { ...visibility, [cardId]: !visibility[cardId] };
        onVisibilityChange(newVisibility);
    };

    return (
        <div className="relative">
            <Button
                ref={buttonRef}
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(prev => !prev)}
                leftIconName="fas fa-palette"
                aria-label="Customize Dashboard"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                Custom Dashboard
            </Button>
            
            {isOpen && (
                <div
                    ref={menuRef}
                    className="origin-top-right absolute right-0 top-full mt-2 w-72 rounded-lg shadow-xl bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 focus:outline-none z-50"
                >
                    <div className="p-4">
                        <h3 className="text-lg font-semibold text-[#293c51] dark:text-gray-100 mb-4">Customize Dashboard</h3>
                        
                        <div>
                            <p className="font-semibold text-sm text-[#293c51] dark:text-gray-200 mb-2">Visible Widgets</p>
                            <div className="space-y-1">
                                {allCards.map(card => (
                                    <div key={card.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                        <label htmlFor={`toggle-${card.id}`} className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">{card.name}</label>
                                        <ToggleSwitch
                                            id={`toggle-${card.id}`}
                                            checked={!!visibility[card.id]}
                                            onChange={() => handleToggleVisibility(card.id)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};