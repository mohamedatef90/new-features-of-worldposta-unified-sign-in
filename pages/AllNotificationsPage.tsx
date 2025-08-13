import React from 'react';
import { Card, Button, Icon } from '@/components/ui';
import type { AppNotification } from '@/types';
import { NotificationType } from '@/types';

const mockAllNotifications: AppNotification[] = [
    { id: '1', type: NotificationType.SUCCESS, message: 'Your profile has been updated.', timestamp: new Date(Date.now() - 3600000 * 2) },
    { id: '2', type: NotificationType.SECURITY, message: 'A new device has logged into your account from London, UK.', timestamp: new Date(Date.now() - 3600000 * 5) },
    { id: '3', type: NotificationType.INFO, message: 'Welcome to WorldPosta! Explore our services.', timestamp: new Date(Date.now() - 3600000 * 26) },
    { id: '4', type: NotificationType.WARNING, message: 'Your subscription for "Posta Basic" is expiring in 7 days.', timestamp: new Date(Date.now() - 3600000 * 48) },
    { id: '5', type: NotificationType.ERROR, message: 'Failed to create snapshot for "db-main-vm".', timestamp: new Date(Date.now() - 3600000 * 72) },
    { id: '6', type: NotificationType.SUCCESS, message: 'Support ticket TKT-58275 has been resolved.', timestamp: new Date(Date.now() - 3600000 * 120) },
];

export const AllNotificationsPage: React.FC = () => {
    const getNotificationIconName = (type: NotificationType) => {
        switch (type) {
            case NotificationType.INFO: return 'fas fa-info-circle text-blue-500';
            case NotificationType.SUCCESS: return 'fas fa-check-circle text-green-500';
            case NotificationType.WARNING: return 'fas fa-exclamation-triangle text-yellow-500';
            case NotificationType.ERROR: return 'fas fa-times-circle text-red-500';
            case NotificationType.SECURITY: return 'fas fa-shield-halved text-purple-500';
            default: return 'fas fa-bell';
        }
    };
    
    return (
        <Card title="All Notifications" titleActions={<Button variant="outline" size="sm">Mark all as read</Button>}>
            <div className="space-y-3">
                {mockAllNotifications.length > 0 ? (
                    mockAllNotifications.map(notif => (
                        <div key={notif.id} className="flex items-start p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                             <Icon name={getNotificationIconName(notif.type)} className="mr-4 mt-1 text-xl" fixedWidth />
                             <div className="flex-grow">
                                <p className="font-medium text-[#293c51] dark:text-gray-200">{notif.message}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(notif.timestamp).toLocaleString()}</p>
                             </div>
                             <button className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                                <Icon name="fas fa-times" />
                             </button>
                        </div>
                    ))
                ) : (
                    <p className="text-center py-6 text-gray-500 dark:text-gray-400">You have no notifications.</p>
                )}
            </div>
        </Card>
    );
};
