
import React from 'react';
import { Card, Button } from '@/components/ui';

export const ResellerProgramPage: React.FC = () => {
    return (
        <Card title="Reseller Program Overview">
            <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">Manage your reseller activities, track commissions, and access marketing materials.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <Card className="bg-green-50 dark:bg-green-900/40">
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">15</p>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Customers</p>
                    </Card>
                    <Card className="bg-blue-50 dark:bg-blue-900/40">
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">$1,250.30</p>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Commission This Month</p>
                    </Card>
                     <Card className="bg-yellow-50 dark:bg-yellow-900/40">
                        <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">$7,830.00</p>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Commission (YTD)</p>
                    </Card>
                </div>

                <div className="space-y-2 pt-4">
                     <Button fullWidth variant="secondary" leftIconName="fas fa-users" onClick={() => alert("Navigate to manage customers")}>Manage My Customers</Button>
                     <Button fullWidth variant="outline" leftIconName="fas fa-file-invoice-dollar">View Commission Reports</Button>
                     <Button fullWidth variant="outline" leftIconName="fas fa-book">Marketing Materials & Branding</Button>
                </div>
            </div>
        </Card>
    );
};
