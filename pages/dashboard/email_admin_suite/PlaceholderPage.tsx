
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Card, Icon } from '@/components/ui';

export const PlaceholderPage: React.FC = () => {
    const location = useLocation();
    const pageName = location.pathname.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return (
        <Card>
            <div className="text-center p-10">
                <Icon name="fas fa-tools" className="text-4xl text-gray-400 dark:text-gray-500 mb-4" />
                <h1 className="text-2xl font-bold text-[#293c51] dark:text-gray-100">{pageName}</h1>
                <p className="mt-2 text-gray-500 dark:text-gray-400">This page is under construction and will be available soon.</p>
            </div>
        </Card>
    );
};
