

import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { ApplicationCardData } from '@/types';
import { Card, Icon, Button } from '@/components/ui';

const ApplicationCard: React.FC<ApplicationCardData & { cardSize?: string }> = ({ name, description, iconName, launchUrl, cardSize }) => {
  const navigate = useNavigate();
  const handleLaunch = () => {
    if (launchUrl.startsWith('http')) {
      window.open(launchUrl, '_blank');
    } else if (launchUrl.startsWith('/')) {
      navigate(launchUrl);
    } else {
       if (launchUrl === '#email-admin-subs') {
        navigate('/app/billing/email-subscriptions'); 
      } else if (launchUrl === '#cloudedge-configs') {
        navigate('/app/billing/cloudedge-configurations'); 
      } else {
        alert(`Action for: ${name}`);
      }
    }
  };

  const isImageUrl = iconName.startsWith('http') || iconName.startsWith('/');

  return (
    <Card className={`flex flex-col h-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-lg border border-gray-300/70 dark:border-slate-600/50 rounded-xl p-6 transition-all hover:border-gray-400 dark:hover:border-slate-500 ${cardSize}`}>
      <div className="flex-grow">
        <div className="flex items-center space-x-3 mb-3">
          {isImageUrl ? (
            <img src={iconName} alt={`${name} icon`} className="h-8 w-auto" />
          ) : (
            <Icon name={iconName} className="text-2xl text-[#679a41] dark:text-emerald-400" />
          )}
          <h3 className="text-xl font-semibold text-[#293c51] dark:text-gray-100">{name}</h3>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{description}</p>
      </div>
      <div className="mt-auto">
         <hr className="my-4 border-gray-200/50 dark:border-gray-700/50" />
        <Button variant="primary" fullWidth onClick={handleLaunch}>
          View {name}
        </Button>
      </div>
    </Card>
  );
};

export const ResellerDashboardPage: React.FC = () => {
    const resellerApps: (ApplicationCardData & {section: 'product' | 'application'})[] = [
        {
            id: 'customers',
            name: 'My Customers',
            description: 'Access and manage your customer accounts and view their dashboards.',
            iconName: 'fas fa-user-friends',
            launchUrl: '/app/reseller/customers',
            section: 'application'
        },
        {
            id: 'billing',
            name: 'Reseller Billing',
            description: 'Manage your billing, commissions, and payment history.',
            iconName: 'fas fa-file-invoice-dollar',
            launchUrl: '/app/billing',
            section: 'application'
        }
    ];
     return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-[#293c51] dark:text-gray-100">Reseller Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resellerApps.map(app => <ApplicationCard key={app.id} {...app} />)}
            </div>
        </div>
    );
};
