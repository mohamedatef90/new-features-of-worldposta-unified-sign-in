import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card, Icon, FormField } from '@/components/ui';
import type { ApplicationCardData, User, Invoice } from '@/types';
import { useAuth } from '@/context';
import { mockInvoices, MOCK_USERS, mockPostaPackages } from '@/data';

// --- Customer/Reseller View Components ---

const ApplicationCard: React.FC<ApplicationCardData & { cardSize?: string }> = ({ name, description, iconName, launchUrl, cardSize }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const handleLaunch = () => {
      // Forward search params to maintain view-as context
      const queryString = searchParams.toString();
      const finalUrl = `${launchUrl}${queryString ? `?${queryString}` : ''}`;
      
      if (launchUrl.startsWith('http')) {
        window.open(launchUrl, '_blank');
      } else if (launchUrl.startsWith('/')) {
        navigate(finalUrl);
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
            Launch Application
          </Button>
        </div>
      </Card>
    );
  };

interface Subscription {
  id: string;
  productName: string;
  subscribeDate: string;
  endDate: string;
  status: 'active' | 'pending' | 'expired';
  manageUrl: string;
}

const SubscriptionCard: React.FC<{ subscription: Subscription }> = ({ subscription }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const getStatusChip = (status: 'active' | 'pending' | 'expired') => {
    const baseClasses = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
    switch (status) {
      case 'active':
        return <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`}>Active</span>;
      case 'pending':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`}>Pending</span>;
      case 'expired':
        return <span className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`}>Expired</span>;
      default:
        return null;
    }
  };

  const handleAction = (url: string) => {
      // Forward search params to maintain view-as context
      const queryString = searchParams.toString();
      const finalUrl = `${url}${queryString ? `?${queryString}` : ''}`;
      navigate(finalUrl);
  };

  return (
    <Card className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="flex-grow">
          <h3 className="text-lg font-semibold text-[#293c51] dark:text-gray-100">{subscription.productName}</h3>
          <div className="flex flex-wrap text-sm text-gray-500 dark:text-gray-400 mt-1 gap-x-4 gap-y-1">
            <span>Subscribed: {new Date(subscription.subscribeDate).toLocaleDateString()}</span>
            <span>Renews/Ends: {new Date(subscription.endDate).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center mt-4 md:mt-0 md:ml-6 gap-2 flex-shrink-0">
          {getStatusChip(subscription.status)}
          {subscription.status === 'pending' && <Button size="sm" variant="outline" onClick={() => handleAction(subscription.manageUrl)}>Edit</Button>}
          {subscription.status === 'active' && <Button size="sm" onClick={() => handleAction(subscription.manageUrl)}>Manage</Button>}
          {subscription.status === 'expired' && <Button size="sm" onClick={() => handleAction(subscription.manageUrl)}>Renew</Button>}
        </div>
      </div>
    </Card>
  );
};

const CustomerBillingView: React.FC = () => {
    const billingApps: (ApplicationCardData & { section: 'product' | 'application' })[] = [
        {
        id: 'email-subs',
        name: 'Posta Email Subscriptions',
        description: 'Manage licenses, plans, and advanced features for your Posta email services.',
        iconName: 'fas fa-envelope-open-text',
        launchUrl: '/app/billing/email-subscriptions',
        section: 'application',
        },
        {
        id: 'cloudedge-configs',
        name: 'CloudEdge Configurations',
        description: 'Configure and get estimates for your virtual data centers and instances.',
        iconName: 'fas fa-server',
        launchUrl: '/app/billing/cloudedge-configurations',
        section: 'application',
        },
    ];

    const mockSubscriptions: Subscription[] = [
        { id: 'sub1', productName: 'Posta Standard Plan (10 users)', subscribeDate: '2024-01-15', endDate: '2025-01-15', status: 'active', manageUrl: '/app/billing/email-configurations' },
        { id: 'sub2', productName: 'CloudEdge - Web Server Cluster', subscribeDate: '2024-06-01', endDate: '2024-07-01', status: 'pending', manageUrl: '/app/billing/cloudedge-configurations' },
        { id: 'sub3', productName: 'Posta Basic Plan (5 users)', subscribeDate: '2023-05-20', endDate: '2024-05-20', status: 'expired', manageUrl: '/app/billing/email-subscriptions' },
    ];

    return (
        <div className="space-y-6">
        <h1 className="text-3xl font-bold text-[#293c51] dark:text-gray-100">Subscriptions</h1>
        <p className="text-gray-600 dark:text-gray-400">
            From here you can manage your existing subscriptions or add new services for your account.
        </p>

        <div>
            <h2 className="text-2xl font-semibold text-[#293c51] dark:text-gray-200 mb-4">Manage & Add Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {billingApps.map(app => <ApplicationCard key={app.id} {...app} />)}
            </div>
        </div>

        <div>
            <h2 className="text-2xl font-semibold text-[#293c51] dark:text-gray-200 mb-4">My Subscriptions</h2>
            {mockSubscriptions.length > 0 ? (
            <div className="space-y-4">
                {mockSubscriptions.map(sub => <SubscriptionCard key={sub.id} subscription={sub} />)}
            </div>
            ) : (
            <Card>
                <p className="text-center text-gray-500 dark:text-gray-400">You have no active subscriptions.</p>
            </Card>
            )}
        </div>
        </div>
    );
};

// --- Admin View Components ---

// Types and Data for Due Invoices
type DueInvoiceFilters = {
  customerName: string;
  packageName: string;
  customerStatus: 'all' | User['status'];
  invoiceDateFrom: string;
  invoiceDateTo: string;
  isTrial: 'all' | 'yes' | 'no';
};

type CombinedInvoice = Invoice & { customer?: User };

// Types and Data for Payment Validations
type PaymentValidationStatus = 'Pending' | 'Validated' | 'Rejected';
interface PaymentValidationRequest {
    id: string;
    customerName: string;
    userName: string;
    totalAmount: number;
    createdDate: string;
    status: PaymentValidationStatus;
    referenceId: string;
    paymentMethod: string;
    customerId: string;
}

type PaymentValidationFilters = {
    customerName: string;
    status: 'all' | PaymentValidationStatus;
    dateFrom: string;
    dateTo: string;
};

const mockPaymentValidations: PaymentValidationRequest[] = [
    { id: 'pv-001', customerId: 'user123', customerName: 'Alpha Inc.', userName: 'Demo Customer Alpha', totalAmount: 250.00, createdDate: new Date(Date.now() - 86400000).toISOString(), status: 'Pending', referenceId: 'BANK-TR-581A', paymentMethod: 'Bank Transfer' },
    { id: 'pv-002', customerId: 'user-new-1', customerName: 'Peanuts Comics', userName: 'Charlie Brown', totalAmount: 38.00, createdDate: new Date(Date.now() - 86400000 * 2).toISOString(), status: 'Validated', referenceId: 'MANUAL-ENTRY-012', paymentMethod: 'Manual Entry' },
    { id: 'pv-003', customerId: 'user-new-3', customerName: 'Great Pumpkin Believers', userName: 'Linus van Pelt', totalAmount: 55.00, createdDate: new Date(Date.now() - 86400000 * 3).toISOString(), status: 'Rejected', referenceId: 'CHECK-PMT-991', paymentMethod: 'Check' },
    { id: 'pv-004', customerId: 'user-new-2', customerName: 'Psychiatric Help Inc.', userName: 'Lucy van Pelt', totalAmount: 18.00, createdDate: new Date(Date.now() - 86400000 * 0.5).toISOString(), status: 'Pending', referenceId: 'BANK-TR-582B', paymentMethod: 'Bank Transfer' },
];

// Filter Panel for Due Invoices
interface DueInvoiceFilterPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: DueInvoiceFilters) => void;
    onClear: () => void;
    currentFilters: DueInvoiceFilters;
}

const DueInvoiceFilterPanel: React.FC<DueInvoiceFilterPanelProps> = ({ isOpen, onClose, onApply, onClear, currentFilters }) => {
    const [localFilters, setLocalFilters] = useState<DueInvoiceFilters>(currentFilters);

    useEffect(() => {
        if (isOpen) {
            setLocalFilters(currentFilters);
        }
    }, [isOpen, currentFilters]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocalFilters(prev => ({...prev, [name]: value}));
    };

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    const handleClear = () => {
        onClear();
        onClose();
    };
    
    return (
         <>
            {isOpen && <div className="fixed inset-0 bg-black/60 z-[59]" onClick={onClose} aria-hidden="true" />}
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-sm bg-[#f8f8f8] dark:bg-slate-800 shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="filter-panel-title"
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
                    <h2 id="filter-panel-title" className="text-lg font-semibold text-[#293c51] dark:text-gray-100 flex items-center">
                        <Icon name="fas fa-filter" className="mr-2" />
                        Filter Due Invoices
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-slate-700" aria-label="Close filters">
                        <Icon name="fas fa-times" className="text-xl" />
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    <FormField id="customerName" name="customerName" label="Customer Name" value={localFilters.customerName} onChange={handleChange} placeholder="Search by name..."/>
                    <FormField as="select" id="packageName" name="packageName" label="Package" value={localFilters.packageName} onChange={handleChange}>
                        <option value="all">All Packages</option>
                        {mockPostaPackages.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                    </FormField>
                    <FormField as="select" id="customerStatus" name="customerStatus" label="Customer Status" value={localFilters.customerStatus} onChange={handleChange}>
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="blocked">Blocked</option>
                    </FormField>
                    <FormField as="select" id="isTrial" name="isTrial" label="Trial Customer" value={localFilters.isTrial} onChange={handleChange}>
                        <option value="all">All</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                    </FormField>
                     <div className="grid grid-cols-2 gap-4">
                        <FormField id="invoiceDateFrom" name="invoiceDateFrom" label="Invoice Date From" type="date" value={localFilters.invoiceDateFrom} onChange={handleChange} />
                        <FormField id="invoiceDateTo" name="invoiceDateTo" label="Invoice Date To" type="date" value={localFilters.invoiceDateTo} onChange={handleChange} />
                    </div>
                </div>
                <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-x-2 flex justify-end">
                    <Button variant="outline" onClick={handleClear}>Clear Filters</Button>
                    <Button onClick={handleApply}>Apply Filters</Button>
                </div>
            </div>
        </>
    );
};

// Filter Panel for Payment Validations
interface PaymentValidationFilterPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: PaymentValidationFilters) => void;
    onClear: () => void;
    currentFilters: PaymentValidationFilters;
}

const PaymentValidationFilterPanel: React.FC<PaymentValidationFilterPanelProps> = ({ isOpen, onClose, onApply, onClear, currentFilters }) => {
    const [localFilters, setLocalFilters] = useState<PaymentValidationFilters>(currentFilters);

    useEffect(() => {
        if (isOpen) setLocalFilters(currentFilters);
    }, [isOpen, currentFilters]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocalFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleApply = () => { onApply(localFilters); onClose(); };
    const handleClear = () => { onClear(); onClose(); };

    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black/60 z-[59]" onClick={onClose} aria-hidden="true" />}
            <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-[#f8f8f8] dark:bg-slate-800 shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
                    <h2 className="text-lg font-semibold text-[#293c51] dark:text-gray-100 flex items-center">
                        <Icon name="fas fa-filter" className="mr-2" />
                        Filter Payment Validations
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-slate-700" aria-label="Close filters">
                        <Icon name="fas fa-times" className="text-xl" />
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    <FormField id="customerName" name="customerName" label="Customer/User Name" value={localFilters.customerName} onChange={handleChange} placeholder="Search by name..." />
                    <FormField as="select" id="status" name="status" label="Validation Status" value={localFilters.status} onChange={handleChange}>
                        <option value="all">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Validated">Validated</option>
                        <option value="Rejected">Rejected</option>
                    </FormField>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField id="dateFrom" name="dateFrom" label="Created After" type="date" value={localFilters.dateFrom} onChange={handleChange} />
                        <FormField id="dateTo" name="dateTo" label="Created Before" type="date" value={localFilters.dateTo} onChange={handleChange} />
                    </div>
                </div>
                <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-x-2 flex justify-end">
                    <Button variant="outline" onClick={handleClear}>Clear Filters</Button>
                    <Button onClick={handleApply}>Apply Filters</Button>
                </div>
            </div>
        </>
    );
};


const AdminBillingDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('dueInvoices');
    
    // State for Due Invoices
    const [isDueInvoiceFilterPanelOpen, setIsDueInvoiceFilterPanelOpen] = useState(false);
    const initialDueInvoiceFilters: DueInvoiceFilters = { customerName: '', packageName: 'all', customerStatus: 'all', invoiceDateFrom: '', invoiceDateTo: '', isTrial: 'all' };
    const [dueInvoiceFilters, setDueInvoiceFilters] = useState<DueInvoiceFilters>(initialDueInvoiceFilters);

    // State for Payment Validations
    const [paymentValidations, setPaymentValidations] = useState<PaymentValidationRequest[]>(mockPaymentValidations);
    const [isValidationFilterPanelOpen, setIsValidationFilterPanelOpen] = useState(false);
    const initialValidationFilters: PaymentValidationFilters = { customerName: '', status: 'all', dateFrom: '', dateTo: '' };
    const [validationFilters, setValidationFilters] = useState<PaymentValidationFilters>(initialValidationFilters);
    
    // Memoized data for Due Invoices
    const dueInvoices = useMemo((): CombinedInvoice[] => {
        return mockInvoices
            .filter(inv => inv.status === 'Unpaid')
            .map(inv => ({ ...inv, customer: Object.values(MOCK_USERS).find(u => u.id === inv.customerId) }));
    }, []);

    const filteredDueInvoices = useMemo(() => {
        return dueInvoices.filter(invoice => {
            const customer = invoice.customer;
            if (!customer) return false;

            const nameMatch = dueInvoiceFilters.customerName === '' || customer.fullName.toLowerCase().includes(dueInvoiceFilters.customerName.toLowerCase());
            const packageMatch = dueInvoiceFilters.packageName === 'all' || invoice.packageName === dueInvoiceFilters.packageName;
            const statusMatch = dueInvoiceFilters.customerStatus === 'all' || customer.status === dueInvoiceFilters.customerStatus;
            const trialMatch = dueInvoiceFilters.isTrial === 'all' || (dueInvoiceFilters.isTrial === 'yes' && customer.isTrial) || (dueInvoiceFilters.isTrial === 'no' && !customer.isTrial);

            let dateMatch = true;
            const invoiceDate = new Date(invoice.date);
            if (dueInvoiceFilters.invoiceDateFrom && invoiceDate < new Date(dueInvoiceFilters.invoiceDateFrom)) dateMatch = false;
            if (dueInvoiceFilters.invoiceDateTo) {
                const toDate = new Date(dueInvoiceFilters.invoiceDateTo);
                toDate.setHours(23, 59, 59, 999);
                if (invoiceDate > toDate) dateMatch = false;
            }
            return nameMatch && packageMatch && statusMatch && trialMatch && dateMatch;
        });
    }, [dueInvoices, dueInvoiceFilters]);

    const activeDueInvoiceFilterCount = useMemo(() => Object.values(dueInvoiceFilters).filter(v => v !== '' && v !== 'all').length, [dueInvoiceFilters]);

    // Memoized data for Payment Validations
    const filteredPaymentValidations = useMemo(() => {
        return paymentValidations.filter(pv => {
            const nameMatch = validationFilters.customerName === '' || 
                pv.customerName.toLowerCase().includes(validationFilters.customerName.toLowerCase()) || 
                pv.userName.toLowerCase().includes(validationFilters.customerName.toLowerCase());
            const statusMatch = validationFilters.status === 'all' || pv.status === validationFilters.status;

            let dateMatch = true;
            const createdDate = new Date(pv.createdDate);
            if (validationFilters.dateFrom && createdDate < new Date(validationFilters.dateFrom)) dateMatch = false;
            if (validationFilters.dateTo) {
                const toDate = new Date(validationFilters.dateTo);
                toDate.setHours(23, 59, 59, 999);
                if (createdDate > toDate) dateMatch = false;
            }

            return nameMatch && statusMatch && dateMatch;
        });
    }, [paymentValidations, validationFilters]);

    const activeValidationFilterCount = useMemo(() => Object.values(validationFilters).filter(v => v !== '' && v !== 'all').length, [validationFilters]);

    // Helper functions for Due Invoices
    const calculateRemainingDays = (dueDateStr?: string) => {
        if (!dueDateStr) return { text: 'N/A', className: '' };
        const dueDate = new Date(dueDateStr);
        const today = new Date();
        dueDate.setHours(0,0,0,0);
        today.setHours(0,0,0,0);
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { text: `Overdue by ${Math.abs(diffDays)} days`, className: 'text-red-600 dark:text-red-400 font-semibold' };
        if (diffDays === 0) return { text: 'Due today', className: 'text-yellow-600 dark:text-yellow-400 font-semibold' };
        return { text: `${diffDays} days`, className: '' };
    };
    
    const getCustomerStatusChip = (status: User['status']) => {
        const base = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize';
        switch (status) {
            case 'active': return <span className={`${base} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`}>Active</span>;
            case 'suspended': return <span className={`${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`}>Suspended</span>;
            case 'blocked': return <span className={`${base} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`}>Blocked</span>;
            default: return <span className={`${base} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`}>Unknown</span>;
        }
    };
    
    const handleExport = () => {
        if (filteredDueInvoices.length === 0) {
            alert("No data to export.");
            return;
        }
        const headers = ["Type", "Customer Name", "Package Name", "Due Date", "Remaining Days", "Total Amount", "Customer Status"];
        const rows = filteredDueInvoices.map(invoice => {
            const remaining = calculateRemainingDays(invoice.dueDate);
            const escapeCsv = (str: string) => `"${str.replace(/"/g, '""')}"`;
            return [invoice.type || 'N/A', escapeCsv(invoice.customer?.fullName || 'Unknown'), escapeCsv(invoice.packageName || 'N/A'), invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A', escapeCsv(remaining.text), invoice.amount.toFixed(2), invoice.customer?.status || 'Unknown'].join(',');
        });
        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "due_invoices.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Helper functions for Payment Validations
    const handleValidationStatusChange = (id: string, newStatus: PaymentValidationStatus) => {
        setPaymentValidations(prev => prev.map(pv => pv.id === id ? { ...pv, status: newStatus } : pv));
    };

    const getValidationStatusChip = (status: PaymentValidationStatus) => {
        const base = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize items-center gap-1.5';
        switch (status) {
            case 'Pending': return <span className={`${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`}><Icon name="fas fa-clock" />Pending</span>;
            case 'Validated': return <span className={`${base} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`}><Icon name="fas fa-check-circle" />Validated</span>;
            case 'Rejected': return <span className={`${base} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`}><Icon name="fas fa-times-circle" />Rejected</span>;
            default: return <span className={`${base} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`}>Unknown</span>;
        }
    };

    return (
        <>
            <h1 className="text-3xl font-bold text-[#293c51] dark:text-gray-100 mb-4">Billing Management</h1>
            <div role="tablist" className="inline-flex space-x-1 p-1 bg-gray-200/50 dark:bg-slate-700/50 rounded-lg">
                <button
                    role="tab"
                    aria-selected={activeTab === 'dueInvoices'}
                    onClick={() => setActiveTab('dueInvoices')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#679a41] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
                        activeTab === 'dueInvoices'
                            ? 'bg-white dark:bg-slate-800 text-[#679a41] dark:text-emerald-400 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-[#293c51] dark:hover:text-gray-100'
                    }`}
                >
                    Due Invoices
                </button>
                <button
                    role="tab"
                    aria-selected={activeTab === 'paymentValidations'}
                    onClick={() => setActiveTab('paymentValidations')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#679a41] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
                        activeTab === 'paymentValidations'
                            ? 'bg-white dark:bg-slate-800 text-[#679a41] dark:text-emerald-400 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-[#293c51] dark:hover:text-gray-100'
                    }`}
                >
                    Payment Validations
                </button>
            </div>


            <div className="mt-4">
                {activeTab === 'dueInvoices' && (
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-[#293c51] dark:text-gray-100">Outstanding Invoices</h2>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" onClick={handleExport} leftIconName="fas fa-file-excel">Export as Excel file</Button>
                                <Button variant="outline" onClick={() => setIsDueInvoiceFilterPanelOpen(true)} leftIconName="fas fa-filter" className="relative">
                                    Filters
                                    {activeDueInvoiceFilterCount > 0 && <span className="absolute -top-1 -right-1 flex justify-center items-center h-4 w-4 rounded-full bg-red-500 text-white text-xs font-semibold">{activeDueInvoiceFilterCount}</span>}
                                </Button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50 dark:bg-slate-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Customer Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Package Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Due Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Remaining Days</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total Amount</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Customer Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredDueInvoices.map(invoice => {
                                        const remaining = calculateRemainingDays(invoice.dueDate);
                                        return (
                                            <tr key={invoice.id}>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm">{invoice.type || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">{invoice.customer?.fullName || 'Unknown'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm">{invoice.packageName || 'N/A'}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</td>
                                                <td className={`px-4 py-4 whitespace-nowrap text-sm ${remaining.className}`}>{remaining.text}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">${invoice.amount.toFixed(2)}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm">{getCustomerStatusChip(invoice.customer?.status)}</td>
                                            </tr>
                                        );
                                    })}
                                    {filteredDueInvoices.length === 0 && (
                                        <tr><td colSpan={7} className="text-center py-6 text-gray-500 dark:text-gray-400">No due invoices match the current filters.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
                {activeTab === 'paymentValidations' && (
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-[#293c51] dark:text-gray-100">Payment Validations</h2>
                             <Button variant="outline" onClick={() => setIsValidationFilterPanelOpen(true)} leftIconName="fas fa-filter" className="relative">
                                Filters
                                {activeValidationFilterCount > 0 && <span className="absolute -top-1 -right-1 flex justify-center items-center h-4 w-4 rounded-full bg-red-500 text-white text-xs font-semibold">{activeValidationFilterCount}</span>}
                            </Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50 dark:bg-slate-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Customer Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">User Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total Amount</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Created Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Is Valid</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Validation Process</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredPaymentValidations.map(pv => (
                                        <tr key={pv.id}>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">{pv.customerName}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm">{pv.userName}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">${pv.totalAmount.toFixed(2)}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm">{new Date(pv.createdDate).toLocaleDateString()}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm">{getValidationStatusChip(pv.status)}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                                                {pv.status === 'Pending' ? (
                                                    <div className="flex justify-center items-center gap-2">
                                                        <Button size="sm" variant="primary" onClick={() => handleValidationStatusChange(pv.id, 'Validated')}>Approve</Button>
                                                        <Button size="sm" variant="danger" onClick={() => handleValidationStatusChange(pv.id, 'Rejected')}>Reject</Button>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 dark:text-gray-500 text-xs italic">Processed</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredPaymentValidations.length === 0 && (
                                        <tr><td colSpan={6} className="text-center py-6 text-gray-500 dark:text-gray-400">No payment validations match the current filters.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>
            <DueInvoiceFilterPanel isOpen={isDueInvoiceFilterPanelOpen} onClose={() => setIsDueInvoiceFilterPanelOpen(false)} onApply={setDueInvoiceFilters} onClear={() => setDueInvoiceFilters(initialDueInvoiceFilters)} currentFilters={dueInvoiceFilters} />
            <PaymentValidationFilterPanel isOpen={isValidationFilterPanelOpen} onClose={() => setIsValidationFilterPanelOpen(false)} onApply={setValidationFilters} onClear={() => setValidationFilters(initialValidationFilters)} currentFilters={validationFilters} />
        </>
    );
};


export const BillingSettingsPage: React.FC = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    
    const viewAsUserId = searchParams.get('viewAsUser');
    const isViewAsMode = viewAsUserId && (user?.role === 'admin' || user?.role === 'reseller');

    if (user?.role === 'admin' && !isViewAsMode) {
        return <AdminBillingDashboard />;
    }

    return <CustomerBillingView />;
};