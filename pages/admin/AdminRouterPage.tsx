import React from 'react';
import { Outlet } from 'react-router-dom';

export const AdminRouterPage: React.FC = () => {
    return (
        <div>
            <Outlet />
        </div>
    );
};
