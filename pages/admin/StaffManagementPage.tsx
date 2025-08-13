import React, { useState, useMemo, useEffect } from 'react';
import { Card, Button, FormField, Modal, Icon, SearchableSelect, Tooltip, ToggleSwitch } from '@/components/ui';
import { useAuth } from '@/context';
import { getAllMockInternalUsers, getAllMockStaffGroups, MOCK_ADMIN_ROLES, MOCK_USERS } from '@/data';
import type { User, StaffGroup } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const getStatusChip = (status: User['status']) => {
    let label = 'Unknown';
    let classes = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    let iconName = 'fas fa-question-circle';

    switch (status) {
        case 'active':
            label = 'Active';
            classes = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            iconName = 'fas fa-check-circle';
            break;
        case 'suspended':
            label = 'Suspended';
            classes = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            iconName = 'fas fa-pause-circle';
            break;
        case 'blocked':
            label = 'Blocked';
            classes = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            iconName = 'fas fa-ban';
            break;
    }
    
    return (
      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${classes} capitalize items-center`}>
        <Icon name={iconName} className="mr-1.5" />
        {label}
      </span>
    );
};

type StaffFilters = {
  searchTerm: string;
  role: 'all' | User['role'];
  staffGroupId: 'all' | string;
  status: 'all' | User['status'];
  mfaStatus: 'all' | 'enabled' | 'disabled';
};

interface FilterPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (newFilters: StaffFilters) => void;
    onClear: () => void;
    currentFilters: StaffFilters;
    staffGroups: StaffGroup[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen, onClose, onApply, onClear, currentFilters, staffGroups }) => {
    const [localFilters, setLocalFilters] = useState<StaffFilters>(currentFilters);

    useEffect(() => {
        if (isOpen) {
            setLocalFilters(currentFilters);
        }
    }, [isOpen, currentFilters]);

    const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocalFilters(prev => ({ ...prev, [name]: value }));
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
                        Filter Staff
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-slate-700" aria-label="Close filters">
                        <Icon name="fas fa-times" className="text-xl" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    <FormField id="searchTerm" name="searchTerm" label="Search by Name/Email" value={localFilters.searchTerm} onChange={handleLocalChange} placeholder="e.g., John Doe" />
                    <FormField as="select" id="role" name="role" label="User Type" value={localFilters.role} onChange={handleLocalChange}>
                        <option value="all">All Types</option>
                        <option value="admin">Admin</option>
                        <option value="reseller">Reseller</option>
                    </FormField>
                    <FormField as="select" id="staffGroupId" name="staffGroupId" label="Permission Group" value={localFilters.staffGroupId} onChange={handleLocalChange}>
                        <option value="all">All Groups</option>
                        {staffGroups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
                    </FormField>
                    <FormField as="select" id="status" name="status" label="Status" value={localFilters.status} onChange={handleLocalChange}>
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                    </FormField>
                    <FormField as="select" id="mfaStatus" name="mfaStatus" label="MFA Status" value={localFilters.mfaStatus} onChange={handleLocalChange}>
                        <option value="all">All</option>
                        <option value="enabled">Enabled</option>
                        <option value="disabled">Disabled</option>
                    </FormField>
                </div>

                <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-x-2 flex justify-end">
                    <Button variant="outline" onClick={handleClear}>Clear Filters</Button>
                    <Button onClick={handleApply}>Apply Filters</Button>
                </div>
            </div>
        </>
    );
};

export const StaffManagementPage: React.FC = () => {
    const [staffUsers, setStaffUsers] = useState<User[]>(() => getAllMockInternalUsers());
    const [staffGroups, setStaffGroups] = useState<StaffGroup[]>(() => getAllMockStaffGroups());
    const [activeTab, setActiveTab] = useState('members');
    
    const [groupSearchTerm, setGroupSearchTerm] = useState('');
    const [isGroupFormOpen, setIsGroupFormOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<StaffGroup | null>(null);
    const [groupFormData, setGroupFormData] = useState<{ name: string; description: string; roles: string[] }>({ name: '', description: '', roles: [] });

    const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [deleteUserConfirmationText, setDeleteUserConfirmationText] = useState('');
    
    const [isDeleteGroupModalOpen, setIsDeleteGroupModalOpen] = useState(false);
    const [groupToDelete, setGroupToDelete] = useState<StaffGroup | null>(null);

    const [isUserFormModalOpen, setIsUserFormModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const initialUserFormState = { fullName: '', displayName: '', email: '', password: '', role: 'admin' as User['role'], staffGroupId: '', mfaEnabled: false };
    const [userFormData, setUserFormData] = useState(initialUserFormState);

    const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
    const [userToResetPassword, setUserToResetPassword] = useState<User | null>(null);
    const [resetPasswordData, setResetPasswordData] = useState({ newPassword: '', confirmPassword: '' });

    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const initialFilters: StaffFilters = {
      searchTerm: '',
      role: 'all',
      staffGroupId: 'all',
      status: 'all',
      mfaStatus: 'all',
    };
    const [filters, setFilters] = useState<StaffFilters>(initialFilters);
    
    const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
    const [userToSuspend, setUserToSuspend] = useState<User | null>(null);

    const handleApplyFilters = (newFilters: StaffFilters) => {
        setFilters(newFilters);
    };

    const clearFilters = () => {
        setFilters(initialFilters);
    };
    
    const activeFilterCount = useMemo(() => {
        return Object.values(filters).filter(value => value !== '' && value !== 'all').length;
    }, [filters]);

    const filteredStaffUsers = useMemo(() => {
        return staffUsers.filter(user => {
            const searchTermMatch = filters.searchTerm === '' ||
              user.fullName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
              user.email.toLowerCase().includes(filters.searchTerm.toLowerCase());
            const roleMatch = filters.role === 'all' || user.role === filters.role;
            const groupMatch = filters.staffGroupId === 'all' || user.staffGroupId === filters.staffGroupId;
            const statusMatch = filters.status === 'all' || user.status === filters.status;
            const mfaMatch = filters.mfaStatus === 'all' ||
              (filters.mfaStatus === 'enabled' && user.mfaEnabled) ||
              (filters.mfaStatus === 'disabled' && !user.mfaEnabled);
    
            return searchTermMatch && roleMatch && groupMatch && statusMatch && mfaMatch;
        });
    }, [staffUsers, filters]);

    const tabItems = [
        { id: 'members', name: 'Staff Members' },
        { id: 'groups', name: 'Staff Groups & Permissions' },
    ];

    const filteredGroups = useMemo(() => 
        staffGroups.filter(group => 
            group.name.toLowerCase().includes(groupSearchTerm.toLowerCase())
        ), 
    [staffGroups, groupSearchTerm]);

    // --- User Management Handlers ---
    const handleOpenUserForm = (user: User | null) => {
        setEditingUser(user);
        setUserFormData(user ? { 
            fullName: user.fullName, 
            displayName: user.displayName || '',
            email: user.email, 
            password: '', 
            role: user.role, 
            staffGroupId: user.staffGroupId || '',
            mfaEnabled: !!user.mfaEnabled 
        } : initialUserFormState);
        setIsUserFormModalOpen(true);
    };
    
    const handleSaveUser = () => {
        if (editingUser) { // Update existing user
            const updatedUsers = staffUsers.map(u => u.id === editingUser.id ? { 
                ...u, 
                displayName: userFormData.displayName,
                role: userFormData.role,
                staffGroupId: userFormData.staffGroupId,
                mfaEnabled: userFormData.mfaEnabled,
             } : u);
            setStaffUsers(updatedUsers);
            const userInDb = MOCK_USERS[editingUser.email];
            if (userInDb) {
                userInDb.displayName = userFormData.displayName;
                userInDb.role = userFormData.role;
                userInDb.staffGroupId = userFormData.staffGroupId;
                userInDb.mfaEnabled = userFormData.mfaEnabled;
                if(userFormData.password) userInDb.passwordHash = `hashed${userFormData.password}`;
            }
        } else { // Create new user
            const newUser: User = {
                id: uuidv4(),
                fullName: userFormData.fullName,
                displayName: userFormData.displayName,
                email: userFormData.email,
                role: userFormData.role,
                staffGroupId: userFormData.staffGroupId,
                companyName: 'WorldPosta Admin Dept.',
                avatarUrl: `https://picsum.photos/seed/${uuidv4()}/100/100`,
                status: 'active',
                creationDate: new Date().toISOString(),
                mfaEnabled: userFormData.mfaEnabled,
            };
            MOCK_USERS[newUser.email.toLowerCase()] = { ...newUser, passwordHash: `hashed${userFormData.password}` };
            setStaffUsers(prev => [...prev, newUser]);
        }
        setIsUserFormModalOpen(false);
    };

    const handleOpenDeleteUserModal = (user: User) => {
        setUserToDelete(user);
        setIsDeleteUserModalOpen(true);
    };
    const handleConfirmDeleteUser = () => {
        if (userToDelete && deleteUserConfirmationText === 'DELETE') {
            setStaffUsers(prev => prev.filter(u => u.id !== userToDelete.id));
            delete MOCK_USERS[userToDelete.email];
            setIsDeleteUserModalOpen(false);
            setUserToDelete(null);
        }
    };

     const handleOpenResetPasswordModal = (user: User) => {
        setUserToResetPassword(user);
        setIsResetPasswordModalOpen(true);
    };

    const handleCloseResetPasswordModal = () => {
        setIsResetPasswordModalOpen(false);
        setUserToResetPassword(null);
        setResetPasswordData({ newPassword: '', confirmPassword: '' });
    };

    const handleConfirmResetPassword = () => {
        if (!userToResetPassword) return;
        if (resetPasswordData.newPassword.length < 8) {
            alert('New password must be at least 8 characters long.');
            return;
        }
        if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
            alert('Passwords do not match.');
            return;
        }
        
        const userInDb = MOCK_USERS[userToResetPassword.email];
        if (userInDb) {
            userInDb.passwordHash = `hashed${resetPasswordData.newPassword}`;
            alert(`Password for ${userToResetPassword.fullName} has been successfully reset.`);
            handleCloseResetPasswordModal();
        } else {
            alert('An error occurred. Could not find user to update.');
        }
    };
    
    const handleToggleStatus = (userId: string) => {
        setStaffUsers(prevUsers =>
            prevUsers.map(user => {
                if (user.id === userId) {
                    const newStatus = user.status === 'active' ? 'suspended' : 'active';
                    const userInDb = MOCK_USERS[user.email];
                    if (userInDb) {
                        userInDb.status = newStatus;
                    }
                    return { ...user, status: newStatus };
                }
                return user;
            })
        );
    };
    
    const handleStatusClick = (user: User) => {
        if (user.status === 'active') {
            setUserToSuspend(user);
            setIsSuspendModalOpen(true);
        } else {
            handleToggleStatus(user.id);
        }
    };
    
    const handleConfirmSuspend = () => {
        if (userToSuspend) {
            handleToggleStatus(userToSuspend.id);
            setIsSuspendModalOpen(false);
            setUserToSuspend(null);
        }
    };

    // --- Group Management Handlers ---
    const handleOpenGroupForm = (group: StaffGroup | null) => {
        setEditingGroup(group);
        setGroupFormData(group ? { name: group.name, description: group.description, roles: [...group.permissions] } : { name: '', description: '', roles: [] });
        setIsGroupFormOpen(true);
    };
    
    const handleSaveGroup = () => {
        if (!groupFormData.name.trim()) return;
        if (editingGroup) {
            const updatedGroup = { ...editingGroup, ...groupFormData, permissions: groupFormData.roles };
            setStaffGroups(prev => prev.map(g => g.id === editingGroup.id ? updatedGroup : g));
        } else {
            const newGroup: StaffGroup = { id: uuidv4(), ...groupFormData, permissions: groupFormData.roles };
            setStaffGroups(prev => [...prev, newGroup]);
        }
        setIsGroupFormOpen(false);
    };

    const handleOpenDeleteGroupModal = (group: StaffGroup) => {
        const usersInGroup = staffUsers.filter(u => u.staffGroupId === group.id);
        if (usersInGroup.length > 0) {
            alert(`Cannot delete group "${group.name}" as it's assigned to ${usersInGroup.length} user(s). Please reassign them first.`);
            return;
        }
        setGroupToDelete(group);
        setIsDeleteGroupModalOpen(true);
    };
    const handleConfirmDeleteGroup = () => {
        if (groupToDelete) {
            setStaffGroups(prev => prev.filter(g => g.id !== groupToDelete.id));
            setIsDeleteGroupModalOpen(false);
            setGroupToDelete(null);
        }
    };
    
    const GroupFormView = () => {
        const [roleSearchTerm, setRoleSearchTerm] = useState('');
        const availableRoles = useMemo(() => 
            MOCK_ADMIN_ROLES.filter(role => 
                !groupFormData.roles.includes(role.id) &&
                role.label.toLowerCase().includes(roleSearchTerm.toLowerCase())
            ), 
        [roleSearchTerm, groupFormData.roles]);
        const selectedRolesDetails = useMemo(() => 
            groupFormData.roles
                .map(roleId => MOCK_ADMIN_ROLES.find(r => r.id === roleId))
                .filter(Boolean) as (typeof MOCK_ADMIN_ROLES[0])[], 
        [groupFormData.roles]);

        const handleRoleChange = (roleId: string, checked: boolean) => {
            setGroupFormData(prev => ({
                ...prev,
                roles: checked ? [...prev.roles, roleId] : prev.roles.filter(r => r !== roleId)
            }));
        };

        return (
            <Card title={editingGroup ? 'Edit Staff Group' : 'Create New Staff Group'}>
                <div className="space-y-6">
                    <FormField id="groupName" label="Group Name" value={groupFormData.name} onChange={e => setGroupFormData({ ...groupFormData, name: e.target.value })} required />
                    <FormField id="groupDescription" label="Description" value={groupFormData.description} onChange={e => setGroupFormData({ ...groupFormData, description: e.target.value })} required />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold mb-2">Available Roles</h4>
                            <FormField id="role-search" label="" placeholder="Search roles..." value={roleSearchTerm} onChange={e => setRoleSearchTerm(e.target.value)} />
                            <div className="space-y-2 max-h-80 overflow-y-auto pr-2 border rounded-lg p-3 mt-2">
                                {availableRoles.map(role => (
                                    <div key={role.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                        <p className="font-medium text-sm">{role.label}</p>
                                        <Button size="icon" variant="ghost" onClick={() => handleRoleChange(role.id, true)}><Icon name="fas fa-plus-circle" className="text-green-500"/></Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Selected Roles ({selectedRolesDetails.length})</h4>
                            <div className="space-y-2 max-h-[365px] overflow-y-auto pr-2 border rounded-lg p-3">
                                {selectedRolesDetails.map(role => (
                                    <div key={role.id} className="flex items-center justify-between p-2 rounded-md bg-gray-50 dark:bg-slate-700/50">
                                        <p className="font-medium text-sm">{role.label}</p>
                                        <Button size="icon" variant="ghost" onClick={() => handleRoleChange(role.id, false)}><Icon name="fas fa-times-circle" className="text-red-500"/></Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
                        <Button variant="ghost" onClick={() => setIsGroupFormOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveGroup} disabled={!groupFormData.name.trim()}>{editingGroup ? 'Save Changes' : 'Save Group'}</Button>
                    </div>
                </div>
            </Card>
        );
    };

    return (
        <div className="space-y-4">
            <div role="tablist" className="inline-flex space-x-1 p-1 bg-gray-200/50 dark:bg-slate-700/50 rounded-lg">
                {tabItems.map(tab => (
                    <button
                        key={tab.id}
                        role="tab"
                        aria-selected={activeTab === tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#679a41] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
                            activeTab === tab.id
                                ? 'bg-white dark:bg-slate-800 text-[#679a41] dark:text-emerald-400 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-[#293c51] dark:hover:text-gray-100'
                        }`}
                    >
                        {tab.name}
                    </button>
                ))}
            </div>
            <div>
                {activeTab === 'members' && (
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-[#293c51] dark:text-gray-100">Staff Members</h2>
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
                                <Button leftIconName="fas fa-plus" onClick={() => handleOpenUserForm(null)}>Add Staff Member</Button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white dark:bg-slate-800">
                                <thead className="bg-gray-50 dark:bg-slate-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Permissions Group</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Creation Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">MFA</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredStaffUsers.map(user => (
                                        <tr key={user.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#293c51] dark:text-white">{user.fullName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.displayName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 capitalize">{user.role}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{staffGroups.find(g => g.id === user.staffGroupId)?.name || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.creationDate ? new Date(user.creationDate).toLocaleDateString() : 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <Tooltip text={user.status === 'active' ? 'Click to suspend' : 'Click to activate'}>
                                                    <button
                                                        onClick={() => handleStatusClick(user)}
                                                        className="group flex items-center p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#679a41] dark:focus:ring-emerald-400"
                                                    >
                                                        {getStatusChip(user.status)}
                                                        <Icon name="fas fa-sync-alt" className="hidden group-hover:inline-block text-gray-500 dark:text-gray-400 ml-2 text-xs" />
                                                    </button>
                                                </Tooltip>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={!!user.mfaEnabled}
                                                    disabled
                                                    className="h-4 w-4 rounded border-gray-300 text-[#679a41] focus:ring-[#679a41]"
                                                    title={user.mfaEnabled ? 'MFA Enabled' : 'MFA Disabled'}
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-1">
                                                    <Button size="icon" variant="ghost" onClick={() => handleOpenUserForm(user)} title="Edit User"><Icon name="fas fa-pencil-alt" /></Button>
                                                    <Button size="icon" variant="ghost" onClick={() => handleOpenResetPasswordModal(user)} title="Reset Password"><Icon name="fas fa-key" className="text-gray-500 dark:text-gray-400" /></Button>
                                                    <Button size="icon" variant="ghost" onClick={() => handleOpenDeleteUserModal(user)} title="Delete User"><Icon name="fas fa-trash-alt" className="text-red-500" /></Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
                {activeTab === 'groups' && (isGroupFormOpen ? <GroupFormView /> :
                    <Card title="Staff Groups" titleActions={<Button leftIconName="fas fa-plus-circle" onClick={() => handleOpenGroupForm(null)}>Create Group</Button>}>
                        <FormField id="group-search" label="" placeholder="Search groups..." value={groupSearchTerm} onChange={e => setGroupSearchTerm(e.target.value)} />
                        <div className="overflow-x-auto mt-4">
                            <table className="min-w-full bg-white dark:bg-slate-800">
                                <thead className="bg-gray-50 dark:bg-slate-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Group Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Assigned Users</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Roles Count</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredGroups.map(group => (
                                        <tr key={group.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#293c51] dark:text-white">{group.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{staffUsers.filter(u => u.staffGroupId === group.id).length}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{group.permissions.length}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-1">
                                                    <Button size="sm" variant="outline" onClick={() => handleOpenGroupForm(group)}>Edit Group</Button>
                                                    <Button size="icon" variant="ghost" onClick={() => handleOpenDeleteGroupModal(group)} title="Delete Group"><Icon name="fas fa-trash-alt" className="text-red-500" /></Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>

            <FilterPanel 
                isOpen={isFilterPanelOpen}
                onClose={() => setIsFilterPanelOpen(false)}
                onApply={handleApplyFilters}
                onClear={clearFilters}
                currentFilters={filters}
                staffGroups={staffGroups}
            />

            {userToSuspend && (
                <Modal 
                    isOpen={isSuspendModalOpen} 
                    onClose={() => {
                        setIsSuspendModalOpen(false);
                        setUserToSuspend(null);
                    }} 
                    title={`Suspend Staff Member`}
                    size="md"
                    footer={
                        <>
                            <Button variant="danger" onClick={handleConfirmSuspend}>Suspend User</Button>
                            <Button variant="ghost" onClick={() => {
                                setIsSuspendModalOpen(false);
                                setUserToSuspend(null);
                            }}>Cancel</Button>
                        </>
                    }
                >
                    <div className="flex items-start gap-4">
                        <Icon name="fas fa-exclamation-triangle" className="text-yellow-500 text-2xl mt-1 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-lg text-[#293c51] dark:text-gray-100">Are you sure you want to suspend {userToSuspend.fullName}?</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                Suspending the user will immediately block their access to the portal. They will not be able to log in until their account is reactivated.
                            </p>
                        </div>
                    </div>
                </Modal>
            )}

            {isUserFormModalOpen && (
                <Modal 
                    isOpen={isUserFormModalOpen} 
                    onClose={() => setIsUserFormModalOpen(false)} 
                    title={editingUser ? 'Edit Staff Member' : 'Add Staff Member'}
                    footer={<><Button onClick={handleSaveUser}>Save</Button><Button variant="ghost" onClick={() => setIsUserFormModalOpen(false)}>Cancel</Button></>}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField id="fullName" label="Name" value={userFormData.fullName} onChange={e => setUserFormData(f => ({ ...f, fullName: e.target.value }))} required disabled={!!editingUser} />
                        <FormField id="displayName" label="User Name" value={userFormData.displayName} onChange={e => setUserFormData(f => ({ ...f, displayName: e.target.value }))} required />
                    </div>
                    <FormField id="email" label="Email" type="email" value={userFormData.email} onChange={e => setUserFormData(f => ({ ...f, email: e.target.value }))} required disabled={!!editingUser} />
                    <FormField id="password" label={editingUser ? "New Password" : "Password"} type="password" value={userFormData.password} onChange={e => setUserFormData(f => ({ ...f, password: e.target.value }))} required={!editingUser} hint={editingUser ? "Leave blank to keep current password" : ""}/>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField as="select" id="role" label="User Type" value={userFormData.role} onChange={e => setUserFormData(f => ({ ...f, role: e.target.value as User['role'] }))} required>
                            <option value="admin">Admin</option>
                            <option value="reseller">Reseller</option>
                        </FormField>
                        <SearchableSelect
                            id="staffGroupId"
                            label="Permission Group"
                            options={staffGroups.map(g => ({ value: g.id, label: g.name }))}
                            value={userFormData.staffGroupId}
                            onChange={(value) => setUserFormData(f => ({ ...f, staffGroupId: value }))}
                            placeholder="Select a group..."
                        />
                    </div>
                    <FormField type="checkbox" id="mfaEnabled" name="mfaEnabled" label="MFA Enabled" checked={userFormData.mfaEnabled} onChange={e => setUserFormData(f => ({ ...f, mfaEnabled: (e.target as HTMLInputElement).checked }))} />
                </Modal>
            )}

            {userToDelete && (
                <Modal isOpen={isDeleteUserModalOpen} onClose={() => setIsDeleteUserModalOpen(false)} title={`Delete Staff Member: ${userToDelete.fullName}`}
                    footer={<><Button variant="danger" onClick={handleConfirmDeleteUser} disabled={deleteUserConfirmationText !== 'DELETE'}>Delete</Button><Button variant="ghost" onClick={() => setIsDeleteUserModalOpen(false)}>Cancel</Button></>}>
                    <p>This will permanently delete the staff member <strong>{userToDelete.fullName}</strong>. To confirm, type <strong>DELETE</strong> below.</p>
                    <FormField id="delete-confirm" label="" value={deleteUserConfirmationText} onChange={e => setDeleteUserConfirmationText(e.target.value)} />
                </Modal>
            )}
            
            {groupToDelete && (
                 <Modal isOpen={isDeleteGroupModalOpen} onClose={() => setIsDeleteGroupModalOpen(false)} title={`Delete Group: ${groupToDelete.name}`}
                    footer={<><Button variant="danger" onClick={handleConfirmDeleteGroup}>Delete</Button><Button variant="ghost" onClick={() => setIsDeleteGroupModalOpen(false)}>Cancel</Button></>}>
                    <p>Are you sure you want to delete the group <strong>{groupToDelete.name}</strong>? This cannot be undone.</p>
                 </Modal>
            )}

            {userToResetPassword && (
                <Modal
                    isOpen={isResetPasswordModalOpen}
                    onClose={handleCloseResetPasswordModal}
                    title={`Reset Password for ${userToResetPassword.fullName}`}
                    footer={<>
                        <Button onClick={handleConfirmResetPassword}>Reset Password</Button>
                        <Button variant="ghost" onClick={handleCloseResetPasswordModal}>Cancel</Button>
                    </>}
                >
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Enter a new password for this user. This action cannot be undone.
                    </p>
                    <FormField
                        id="newPasswordReset"
                        label="New Password"
                        type="password"
                        value={resetPasswordData.newPassword}
                        onChange={e => setResetPasswordData(s => ({ ...s, newPassword: e.target.value }))}
                        required
                        showPasswordToggle
                    />
                    <FormField
                        id="confirmNewPasswordReset"
                        label="Confirm New Password"
                        type="password"
                        value={resetPasswordData.confirmPassword}
                        onChange={e => setResetPasswordData(s => ({ ...s, confirmPassword: e.target.value }))}
                        required
                        showPasswordToggle
                    />
                </Modal>
            )}
        </div>
    );
};