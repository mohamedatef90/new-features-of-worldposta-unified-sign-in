




import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormField, Button, Card, Modal, Icon } from '@/components/ui';
import { getAllMockCustomers, MOCK_USERS, getUsersForTeam } from '@/data';
import type { User } from '@/types';

// New: Countries list, can be moved to a shared file later
const countries = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
];

// New: Filter types
type CustomerFilters = {
  searchTerm: string;
  country: 'all' | string;
  status: 'all' | User['status'];
  isTrial: 'all' | 'yes' | 'no';
  registerDateFrom: string;
  registerDateTo: string;
};

// New: FilterPanel component
interface FilterPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (newFilters: CustomerFilters) => void;
    onClear: () => void;
    currentFilters: CustomerFilters;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen, onClose, onApply, onClear, currentFilters }) => {
    const [localFilters, setLocalFilters] = useState<CustomerFilters>(currentFilters);

    useEffect(() => {
        if (isOpen) {
            setLocalFilters(currentFilters);
        }
    }, [isOpen, currentFilters]);

    const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocalFilters(prev => ({ ...prev, [name]: value }));
    };
    
    const handleIsTrialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLocalFilters(prev => ({...prev, isTrial: e.target.value as 'all' | 'yes' | 'no'}));
    }

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
                        Filter Customers
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-slate-700" aria-label="Close filters">
                        <Icon name="fas fa-times" className="text-xl" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    <FormField id="searchTerm" name="searchTerm" label="Search by Name/Email/Company" value={localFilters.searchTerm} onChange={handleLocalChange} placeholder="e.g., John Doe" />
                    <FormField as="select" id="country" name="country" label="Country" value={localFilters.country} onChange={handleLocalChange}>
                        <option value="all">All Countries</option>
                        {countries.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </FormField>
                    <FormField as="select" id="status" name="status" label="Status" value={localFilters.status} onChange={handleLocalChange}>
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="blocked">Blocked</option>
                    </FormField>
                    <FormField as="select" id="isTrial" name="isTrial" label="Trial Status" value={localFilters.isTrial} onChange={handleIsTrialChange}>
                        <option value="all">All</option>
                        <option value="yes">Trial</option>
                        <option value="no">Not Trial</option>
                    </FormField>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField id="registerDateFrom" name="registerDateFrom" label="Registered After" type="date" value={localFilters.registerDateFrom} onChange={handleLocalChange} />
                        <FormField id="registerDateTo" name="registerDateTo" label="Registered Before" type="date" value={localFilters.registerDateTo} onChange={handleLocalChange} />
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


const UserListTable: React.FC<{ 
    users: User[], 
    onUserSelect: (userId: string) => void,
    onUserEdit: (userId: string) => void,
    onUserDelete: (userId: string) => void
}> = ({ users, onUserSelect, onUserEdit, onUserDelete }) => {

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-slate-800">
                <thead className="bg-gray-50 dark:bg-slate-700">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Register Date</th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Users</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Country</th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Trial</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {users.length > 0 ? users.map(user => (
                        <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-[#293c51] dark:text-white">{user.fullName}</div>
                                <div className="text-xs text-gray-500">{user.companyName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                {user.creationDate ? new Date(user.creationDate).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-center">{getUsersForTeam(user.id).length}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                {countries.find(c => c.value === user.country)?.label || user.country || 'N/A'}
                            </td>
                             <td className="px-6 py-4 whitespace-nowrap text-center">
                                <input
                                    type="checkbox"
                                    checked={!!user.isTrial}
                                    disabled
                                    className="h-4 w-4 rounded border-gray-300 text-[#679a41] focus:ring-0 focus:ring-offset-0"
                                    title={user.isTrial ? 'Trial Account' : 'Regular Account'}
                                />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end space-x-2">
                                    <Button size="sm" onClick={() => onUserSelect(user.id)}>
                                        View As
                                    </Button>
                                    <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        onClick={() => onUserEdit(user.id)} 
                                        title="Edit User" 
                                        leftIconName="fas fa-pencil-alt"
                                        className="text-gray-500 hover:text-[#679a41] dark:text-gray-400 dark:hover:text-emerald-400"
                                    />
                                    <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        onClick={() => onUserDelete(user.id)} 
                                        title="Delete User" 
                                        leftIconName="fas fa-trash-alt"
                                        className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500"
                                    />
                                </div>
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan={7} className="text-center py-4 text-gray-500 dark:text-gray-400">No users found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export const UserManagementPage: React.FC = () => {
    const [customers, setCustomers] = useState(() => getAllMockCustomers());
    const navigate = useNavigate();
    
    // State for delete modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

    // New: State for filters
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const initialFilters: CustomerFilters = {
      searchTerm: '',
      country: 'all',
      status: 'all',
      isTrial: 'all',
      registerDateFrom: '',
      registerDateTo: '',
    };
    const [filters, setFilters] = useState<CustomerFilters>(initialFilters);

    // New: memoized filtered users
    const filteredUsers = useMemo(() => {
        return customers.filter(user => {
            const searchTermMatch = filters.searchTerm === '' ||
              user.fullName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
              user.email.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
              user.companyName.toLowerCase().includes(filters.searchTerm.toLowerCase());
            
            const countryMatch = filters.country === 'all' || user.country === filters.country;
            const statusMatch = filters.status === 'all' || user.status === filters.status;
            const trialMatch = filters.isTrial === 'all' || (filters.isTrial === 'yes' && user.isTrial) || (filters.isTrial === 'no' && !user.isTrial);

            let dateMatch = true;
            if (user.creationDate) {
                const userDate = new Date(user.creationDate);
                if (filters.registerDateFrom && userDate < new Date(filters.registerDateFrom)) {
                    dateMatch = false;
                }
                if (filters.registerDateTo) {
                    const toDate = new Date(filters.registerDateTo);
                    toDate.setHours(23, 59, 59, 999);
                    if (userDate > toDate) {
                        dateMatch = false;
                    }
                }
            } else if (filters.registerDateFrom || filters.registerDateTo) {
                dateMatch = false;
            }
    
            return searchTermMatch && countryMatch && statusMatch && trialMatch && dateMatch;
        });
    }, [customers, filters]);

    // New: active filter count
    const activeFilterCount = useMemo(() => {
        return (Object.keys(filters) as Array<keyof CustomerFilters>).reduce((count, key) => {
            if (key === 'searchTerm' && filters[key] !== '') {
                return count + 1;
            }
            if (key !== 'searchTerm' && filters[key] !== 'all' && filters[key] !== '') {
                return count + 1;
            }
            return count;
        }, 0);
    }, [filters]);


    const handleViewAs = (userId: string) => {
        navigate(`/app/dashboard?viewAsUser=${userId}&returnTo=/app/admin/users`);
    };
    
    const handleEditUser = (userId: string) => {
        alert(`Editing customer ID: ${userId}. This would typically open a customer editing modal or page.`);
    };

    const handleOpenDeleteModal = (userId: string) => {
        const user = customers.find(c => c.id === userId);
        if (user) {
            setUserToDelete(user);
            setDeleteConfirmationText('');
            setIsDeleteModalOpen(true);
        }
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
    };

    const handleConfirmDelete = () => {
        if (userToDelete && deleteConfirmationText === 'DELETE') {
            setCustomers(prev => prev.filter(c => c.id !== userToDelete.id));
            if (MOCK_USERS[userToDelete.email]) {
                delete MOCK_USERS[userToDelete.email];
            }
            handleCloseDeleteModal();
        }
    };
    
    return (
        <>
            <Card>
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-[#293c51] dark:text-gray-100">Customer Management</h2>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsFilterPanelOpen(true)}
                            leftIconName="fas fa-filter"
                            className="relative"
                        >
                            Filters
                            {activeFilterCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex justify-center items-center h-4 w-4 rounded-full bg-red-500 text-white text-xs font-semibold">
                                    {activeFilterCount}
                                </span>
                            )}
                        </Button>
                        <Button leftIconName="fas fa-user-plus" onClick={() => navigate('/app/admin/users/add')}>Add New Customer</Button>
                    </div>
                </div>
                <UserListTable 
                    users={filteredUsers}
                    onUserSelect={handleViewAs} 
                    onUserEdit={handleEditUser}
                    onUserDelete={handleOpenDeleteModal}
                />
            </Card>

            <FilterPanel
                isOpen={isFilterPanelOpen}
                onClose={() => setIsFilterPanelOpen(false)}
                onApply={setFilters}
                onClear={() => setFilters(initialFilters)}
                currentFilters={filters}
            />
            
            {isDeleteModalOpen && userToDelete && (
                 <Modal 
                    isOpen={isDeleteModalOpen} 
                    onClose={handleCloseDeleteModal}
                    title={`Delete Customer: ${userToDelete.fullName}`}
                    size="md"
                    footer={
                        <>
                            <Button 
                                variant="danger" 
                                onClick={handleConfirmDelete}
                                disabled={deleteConfirmationText !== 'DELETE'}
                            >
                                Delete Customer
                            </Button>
                            <Button variant="ghost" onClick={handleCloseDeleteModal}>Cancel</Button>
                        </>
                    }
                >
                    <div className="space-y-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            This action is permanent and cannot be undone. You are about to delete the customer account for 
                            <strong className="text-red-600 dark:text-red-400"> {userToDelete.fullName} ({userToDelete.email})</strong>.
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                           To confirm, please type <strong className="font-mono text-[#293c51] dark:text-gray-200">DELETE</strong> in the box below.
                        </p>
                        <FormField
                            id="delete-confirm-admin"
                            label=""
                            value={deleteConfirmationText}
                            onChange={(e) => setDeleteConfirmationText(e.target.value)}
                            placeholder="Type DELETE to confirm"
                            inputClassName="text-center tracking-widest"
                        />
                    </div>
                </Modal>
            )}
        </>
    );
};