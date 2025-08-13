
import React from 'react';
import { Outlet } from 'react-router-dom';

export const InvoiceRouterPage: React.FC = () => {
    return (
        <div>
            <Outlet />
        </div>
    );
};
