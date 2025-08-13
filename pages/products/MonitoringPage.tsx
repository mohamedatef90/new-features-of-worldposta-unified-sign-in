
import React from 'react';
import { Card, Button, Icon } from '@/components/ui';
import { mockSecurityAlerts } from '@/data';
import type { SecurityAlert } from '@/types';

const getSeverityChipClass = (severity: SecurityAlert['severity']) => {
    switch (severity) {
        case 'Critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-300';
        case 'High': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-300';
        case 'Medium': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-300';
        case 'Low': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-300';
        default: return 'bg-gray-200 text-gray-800 border-gray-400';
    }
};

export const MonitoringPage: React.FC = () => {
    return (
        <Card title="Monitoring & Security Alerts">
             <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-50 dark:bg-slate-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Severity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Resource</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Timestamp</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {mockSecurityAlerts.map(alert => (
                            <tr key={alert.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${getSeverityChipClass(alert.severity)}`}>
                                        {alert.severity}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#293c51] dark:text-white">{alert.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-300">{alert.resource}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(alert.timestamp).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <Button size="icon" variant="ghost"><Icon name="fas fa-ellipsis-h" /></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};
