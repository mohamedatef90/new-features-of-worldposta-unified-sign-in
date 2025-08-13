import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Icon } from '@/components/ui';

export const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center p-4">
             <Icon name="fas fa-exclamation-triangle" className="text-6xl text-yellow-400 mb-4" />
            <h1 className="text-6xl font-bold text-[#293c51] dark:text-gray-100">404</h1>
            <p className="text-xl mt-4 mb-2 text-gray-700 dark:text-gray-300">Page Not Found</p>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Sorry, the page you are looking for could not be found.</p>
            <Button onClick={() => navigate('/app/dashboard')}>Go to Dashboard</Button>
        </div>
    );
};
