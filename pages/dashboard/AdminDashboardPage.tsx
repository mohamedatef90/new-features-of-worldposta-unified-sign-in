
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


export const AdminDashboardPage: React.FC = () => {
    const adminApps: (ApplicationCardData & {section: 'product' | 'application'})[] = [
        { 
            id: 'cloudedge', 
            name: 'CloudEdge', 
            description: 'Manage your cloud infrastructure, VMs, and network resources efficiently.', 
            iconName: "https://console.worldposta.com/assets/loginImgs/edgeLogo.png", 
            launchUrl: '/app/cloud-edge',
            section: 'product',
        },
        { 
            id: 'emailadmin', 
            name: 'Email Admin Suite', 
            description: 'Administer your email services, mailboxes, users, and domains with ease.', 
            iconName: "https://www.worldposta.com/assets/Posta-Logo.png", 
            launchUrl: 'https://tools.worldposta.com/login',
            section: 'product',
        },
        {
            id: 'customers',
            name: 'Customers',
            description: 'Search, manage, and view customer accounts and their dashboards.',
            iconName: 'fas fa-users',
            launchUrl: '/app/admin/users',
            section: 'application'
        },
        {
            id: 'billing',
            name: 'Billings',
            description: 'Access and manage billing for all customer accounts.',
            iconName: 'fas fa-cash-register',
            launchUrl: '/app/billing',
            section: 'application'
        },
        {
            id: 'support',
            name: 'Support Center',
            description: 'View and manage all customer support tickets.',
            iconName: 'fas fa-headset',
            launchUrl: '/app/support',
            section: 'application',
        }
    ];

    const productPortals = adminApps.filter(p => p.section === 'product');
    const applicationPortals = adminApps.filter(p => p.section === 'application');

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-[#293c51] dark:text-gray-100">Admin Dashboard</h1>
            
            <div className="space-y-8">
                {productPortals.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-semibold mb-4 text-[#293c51] dark:text-gray-200">Products</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {productPortals.map(app => <ApplicationCard key={app.id} {...app} />)}
                        </div>
                    </div>
                )}

                {applicationPortals.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-semibold mb-4 text-[#293c51] dark:text-gray-200">Applications</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {applicationPortals.map(app => <ApplicationCard key={app.id} {...app} />)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};