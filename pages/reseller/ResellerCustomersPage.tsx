import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormField, Button, Card, Modal, Icon, Pagination } from '@/components/ui';
import { getAllMockCustomers, MOCK_USERS } from '@/data';
import type { User } from '@/types';

const UserListTable: React.FC<{ 
    users: User[], 
    onUserSelect: (userId: string) => void,
    onUserEdit: (userId: string) => void,
    onUserDelete: (userId: string) => void
}> = ({ users, onUserSelect, onUserEdit, onUserDelete }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        return users.slice(startIndex, startIndex + rowsPerPage);
    }, [users, currentPage, rowsPerPage]);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [users]);


    const getStatusChip = (status: User['status']) => {
        const baseClasses = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize';
        switch (status) {
            case 'active':
                return <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`}>Active</span>;
            case 'suspended':
                return <span className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`}>Suspended</span>;
            case 'blocked':
                return <span className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`}>Blocked</span>;
            default:
                return <span className={`${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`}>Unknown</span>;
        }
    };

    return (
        <div className="overflow-x-auto border dark:border-gray-700 rounded-lg">
            <table className="min-w-full bg-white dark:bg-slate-800">
                <thead className="bg-gray-50 dark:bg-slate-700">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Full Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Company Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedUsers.length > 0 ? paginatedUsers.map(user => (
                        <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#293c51] dark:text-white">{user.fullName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.companyName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                {getStatusChip(user.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end space-x-2">
                                    <Button size="sm" onClick={() => onUserSelect(user.id)}>
                                        View Dashboard
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
                        <tr><td colSpan={5} className="text-center py-4 text-gray-500 dark:text-gray-400">No users found.</td></tr>
                    )}
                </tbody>
            </table>
            <Pagination
                currentPage={currentPage}
                totalItems={users.length}
                itemsPerPage={rowsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(value) => {
                    setRowsPerPage(value);
                    setCurrentPage(1);
                }}
            />
        </div>
    );
}

export const ResellerCustomersPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [customers, setCustomers] = useState(() => getAllMockCustomers()); // In real app, filter by reseller's managed customers
    const navigate = useNavigate();
    
    // State for delete modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

    const filteredUsers = useMemo(() =>
        customers.filter(user =>
            user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.companyName.toLowerCase().includes(searchTerm.toLowerCase())
        ), [customers, searchTerm]);

    const handleViewDashboard = (userId: string) => {
        navigate(`/app/dashboard?viewAsUser=${userId}&returnTo=/app/reseller/customers`);
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
            <Card title="My Customers">
                <div className="flex justify-between items-center mb-4">
                     <div className="w-full max-w-xs">
                        <FormField id="search-reseller-customer" label="" placeholder="Search your customers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <Button leftIconName="fas fa-user-plus">Add New User</Button>
                </div>
                <UserListTable 
                    users={filteredUsers} 
                    onUserSelect={handleViewDashboard} 
                    onUserEdit={handleEditUser}
                    onUserDelete={handleOpenDeleteModal}
                />
            </Card>

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
                            id="delete-confirm-reseller"
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