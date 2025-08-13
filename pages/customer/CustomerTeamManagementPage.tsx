import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Button, FormField, Modal, Icon, CollapsibleSection } from '@/components/ui';
import { useAuth } from '@/context';
import { getUsersForTeam, getGroupsForTeam, getMockUserById, MOCK_PERMISSIONS, MOCK_USERS } from '@/data';
import type { User, UserGroup } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const MOCK_ROLES = [
    { id: 'view_billing', label: 'View Billing', description: 'Allows user to view invoices and payment history.' },
    { id: 'manage_billing', label: 'Manage Billing', description: 'Allows user to manage subscriptions and payment methods.' },
    { id: 'view_services', label: 'View Services', description: 'Grants read-only access to all subscribed services.' },
    { id: 'manage_services', label: 'Manage Services', description: 'Allows user to create, modify, and delete services.' },
    { id: 'admin_team_users', label: 'Administer Team Users', description: 'Grants full control over team members and groups.' },
    { id: 'view_action_logs', label: 'View Action Logs', description: 'Allows user to see the account activity log.' },
    { id: 'devops_delete_supplier', label: 'Delete Devops Supplier', description: 'Allows user to delete the supplier in the devops module.'},
    { id: 'project_edit_stock', label: 'Edit Project Stock', description: 'Allows user to edit the stock in the project module.'},
    { id: 'marketing_approve_deal', label: 'Approve Marketing Deal', description: 'Allows user to approve the deal in the marketing module.'},
    { id: 'crm_configure_payroll', label: 'Configure Crm Payroll', description: 'Allows user to configure the payroll in the crm module.'},
    { id: 'inventory_create_ticket', label: 'Create Inventory Ticket', description: 'Allows user to create the ticket in the inventory module.'},
    { id: 'project_import_contact', label: 'Import Project Contact', description: 'Allows user to import the contact in the project module.'},
    { id: 'security_configure_deal', label: 'Configure Security Deal', description: 'Allows user to configure the deal in the security module.'},
    { id: 'analytics_approve_contact', label: 'Approve Analytics Contact', description: 'Allows user to approve the contact in the analytics module.'},
    { id: 'support_create_timesheet', label: 'Create Support Timesheet', description: 'Allows user to create the timesheet in the support module.'},
    { id: 'devops_edit_deal', label: 'Edit Devops Deal', description: 'Allows user to edit the deal in the devops module.'},
    { id: 'marketing_view_report', label: 'View Marketing Report', description: 'Allows user to view the report in the marketing module.'},
    { id: 'hr_edit_contact', label: 'Edit Hr Contact', description: 'Allows user to edit the contact in the hr module.'},
    { id: 'project_create_campaign', label: 'Create Project Campaign', description: 'Allows user to create the campaign in the project module.'},
    { id: 'finance_create_user_access', label: 'Create Finance User Access', description: 'Allows user to create the user access in the finance module.'},
    { id: 'security_edit_timesheet', label: 'Edit Security Timesheet', description: 'Allows user to edit the timesheet in the security module.'},
    { id: 'devops_export_campaign', label: 'Export Devops Campaign', description: 'Allows user to export the campaign in the devops module.'},
    { id: 'project_delete_deal', label: 'Delete Project Deal', description: 'Allows user to delete the deal in the project module.'},
    { id: 'hr_delete_stock', label: 'Delete Hr Stock', description: 'Allows user to delete the stock in the hr module.'},
    { id: 'analytics_export_deal', label: 'Export Analytics Deal', description: 'Allows user to export the deal in the analytics module.'},
    { id: 'crm_create_stock', label: 'Create Crm Stock', description: 'Allows user to create the stock in the crm module.'},
    { id: 'marketing_view_campaign', label: 'View Marketing Campaign', description: 'Allows user to view the campaign in the marketing module.'},
    { id: 'security_create_budget', label: 'Create Security Budget', description: 'Allows user to create the budget in the security module.'},
    { id: 'hr_import_deal', label: 'Import Hr Deal', description: 'Allows user to import the deal in the hr module.'},
    { id: 'finance_manage_record', label: 'Manage Finance Record', description: 'Allows user to manage the record in the finance module.'},
    { id: 'support_view_record', label: 'View Support Record', description: 'Allows user to view the record in the support module.'},
    { id: 'security_manage_deal', label: 'Manage Security Deal', description: 'Allows user to manage the deal in the security module.'},
    { id: 'analytics_edit_payroll', label: 'Edit Analytics Payroll', description: 'Allows user to edit the payroll in the analytics module.'},
    { id: 'inventory_edit_task', label: 'Edit Inventory Task', description: 'Allows user to edit the task in the inventory module.'},
    { id: 'security_delete_task', label: 'Delete Security Task', description: 'Allows user to delete the task in the security module.'},
    { id: 'crm_view_pipeline', label: 'View Crm Pipeline', description: 'Allows user to view the pipeline in the crm module.'},
    { id: 'project_create_deal', label: 'Create Project Deal', description: 'Allows user to create the deal in the project module.'},
    { id: 'security_manage_pipeline', label: 'Manage Security Pipeline', description: 'Allows user to manage the pipeline in the security module.'},
    { id: 'inventory_view_deal', label: 'View Inventory Deal', description: 'Allows user to view the deal in the inventory module.'},
    { id: 'marketing_configure_contact', label: 'Configure Marketing Contact', description: 'Allows user to configure the contact in the marketing module.'},
    { id: 'finance_export_deal', label: 'Export Finance Deal', description: 'Allows user to export the deal in the finance module.'},
    { id: 'crm_manage_deal', label: 'Manage Crm Deal', description: 'Allows user to manage the deal in the crm module.'},
    { id: 'devops_view_report', label: 'View Devops Report', description: 'Allows user to view the report in the devops module.'},
    { id: 'inventory_export_supplier', label: 'Export Inventory Supplier', description: 'Allows user to export the supplier in the inventory module.'},
    { id: 'finance_delete_timesheet', label: 'Delete Finance Timesheet', description: 'Allows user to delete the timesheet in the finance module.'},
    { id: 'hr_delete_pipeline', label: 'Delete Hr Pipeline', description: 'Allows user to delete the pipeline in the hr module.'},
    { id: 'crm_edit_task', label: 'Edit Crm Task', description: 'Allows user to edit the task in the crm module.'},
    { id: 'analytics_delete_user_access', label: 'Delete Analytics User Access', description: 'Allows user to delete the user access in the analytics module.'},
    { id: 'crm_approve_supplier', label: 'Approve Crm Supplier', description: 'Allows user to approve the supplier in the crm module.'},
    { id: 'marketing_view_supplier', label: 'View Marketing Supplier', description: 'Allows user to view the supplier in the marketing module.'},
    { id: 'devops_configure_deal', label: 'Configure Devops Deal', description: 'Allows user to configure the deal in the devops module.'},
    { id: 'analytics_assign_task', label: 'Assign Analytics Task', description: 'Allows user to assign the task in the analytics module.'},
    { id: 'inventory_manage_budget', label: 'Manage Inventory Budget', description: 'Allows user to manage the budget in the inventory module.'},
    { id: 'hr_delete_deal', label: 'Delete Hr Deal', description: 'Allows user to delete the deal in the hr module.'},
    { id: 'finance_create_supplier', label: 'Create Finance Supplier', description: 'Allows user to create the supplier in the finance module.'},
    { id: 'devops_approve_budget', label: 'Approve Devops Budget', description: 'Allows user to approve the budget in the devops module.'},
    { id: 'support_create_campaign', label: 'Create Support Campaign', description: 'Allows user to create the campaign in the support module.'},
    { id: 'security_configure_report', label: 'Configure Security Report', description: 'Allows user to configure the report in the security module.'},
    { id: 'finance_manage_campaign', label: 'Manage Finance Campaign', description: 'Allows user to manage the campaign in the finance module.'},
    { id: 'project_approve_user_access', label: 'Approve Project User Access', description: 'Allows user to approve the user access in the project module.'},
    { id: 'devops_create_report', label: 'Create Devops Report', description: 'Allows user to create the report in the devops module.'},
    { id: 'analytics_delete_record', label: 'Delete Analytics Record', description: 'Allows user to delete the record in the analytics module.'},
    { id: 'devops_edit_record', label: 'Edit Devops Record', description: 'Allows user to edit the record in the devops module.'},
    { id: 'hr_create_deal', label: 'Create Hr Deal', description: 'Allows user to create the deal in the hr module.'},
    { id: 'marketing_manage_user_access', label: 'Manage Marketing User Access', description: 'Allows user to manage the user access in the marketing module.'},
    { id: 'support_edit_deal', label: 'Edit Support Deal', description: 'Allows user to edit the deal in the support module.'},
    { id: 'marketing_create_contact', label: 'Create Marketing Contact', description: 'Allows user to create the contact in the marketing module.'},
    { id: 'hr_assign_record', label: 'Assign Hr Record', description: 'Allows user to assign the record in the hr module.'},
    { id: 'project_delete_report', label: 'Delete Project Report', description: 'Allows user to delete the report in the project module.'},
    { id: 'support_configure_pipeline', label: 'Configure Support Pipeline', description: 'Allows user to configure the pipeline in the support module.'},
    { id: 'analytics_delete_pipeline', label: 'Delete Analytics Pipeline', description: 'Allows user to delete the pipeline in the analytics module.'},
    { id: 'project_view_record', label: 'View Project Record', description: 'Allows user to view the record in the project module.'},
    { id: 'hr_edit_pipeline', label: 'Edit Hr Pipeline', description: 'Allows user to edit the pipeline in the hr module.'},
    { id: 'project_manage_task', label: 'Manage Project Task', description: 'Allows user to manage the task in the project module.'},
    { id: 'support_view_contact', label: 'View Support Contact', description: 'Allows user to view the contact in the support module.'},
    { id: 'hr_approve_task', label: 'Approve Hr Task', description: 'Allows user to approve the task in the hr module.'},
    { id: 'hr_edit_deal', label: 'Edit Hr Deal', description: 'Allows user to edit the deal in the hr module.'},
    { id: 'hr_create_user_access', label: 'Create Hr User Access', description: 'Allows user to create the user access in the hr module.'},
    { id: 'security_delete_record', label: 'Delete Security Record', description: 'Allows user to delete the record in the security module.'},
    { id: 'devops_view_task', label: 'View Devops Task', description: 'Allows user to view the task in the devops module.'},
    { id: 'inventory_edit_report', label: 'Edit Inventory Report', description: 'Allows user to edit the report in the inventory module.'},
    { id: 'security_view_report', label: 'View Security Report', description: 'Allows user to view the report in the security module.'},
    { id: 'project_configure_report', label: 'Configure Project Report', description: 'Allows user to configure the report in the project module.'},
    { id: 'inventory_view_contact', label: 'View Inventory Contact', description: 'Allows user to view the contact in the inventory module.'},
    { id: 'security_configure_stock', label: 'Configure Security Stock', description: 'Allows user to configure the stock in the security module.'},
    { id: 'analytics_create_user_access', label: 'Create Analytics User Access', description: 'Allows user to create the user access in the analytics module.'},
    { id: 'project_approve_campaign', label: 'Approve Project Campaign', description: 'Allows user to approve the campaign in the project module.'},
    { id: 'marketing_approve_record', label: 'Approve Marketing Record', description: 'Allows user to approve the record in the marketing module.'},
    { id: 'devops_approve_task', label: 'Approve Devops Task', description: 'Allows user to approve the task in the devops module.'},
    { id: 'analytics_import_pipeline', label: 'Import Analytics Pipeline', description: 'Allows user to import the pipeline in the analytics module.'},
    { id: 'crm_approve_report', label: 'Approve Crm Report', description: 'Allows user to approve the report in the crm module.'},
    { id: 'support_delete_pipeline', label: 'Delete Support Pipeline', description: 'Allows user to delete the pipeline in the support module.'},
    { id: 'marketing_delete_pipeline', label: 'Delete Marketing Pipeline', description: 'Allows user to delete the pipeline in the marketing module.'},
    { id: 'marketing_configure_campaign', label: 'Configure Marketing Campaign', description: 'Allows user to configure the campaign in the marketing module.'},
    { id: 'project_view_supplier', label: 'View Project Supplier', description: 'Allows user to view the supplier in the project module.'},
    { id: 'inventory_create_supplier', label: 'Create Inventory Supplier', description: 'Allows user to create the supplier in the inventory module.'},
    { id: 'marketing_delete_timesheet', label: 'Delete Marketing Timesheet', description: 'Allows user to delete the timesheet in the marketing module.'},
    { id: 'analytics_manage_user_access', label: 'Manage Analytics User Access', description: 'Allows user to manage the user access in the analytics module.'},
    { id: 'crm_create_task', label: 'Create Crm Task', description: 'Allows user to create the task in the crm module.'},
    { id: 'analytics_create_deal', label: 'Create Analytics Deal', description: 'Allows user to create the deal in the analytics module.'},
    { id: 'marketing_manage_timesheet', label: 'Manage Marketing Timesheet', description: 'Allows user to manage the timesheet in the marketing module.'},
    { id: 'inventory_create_task', label: 'Create Inventory Task', description: 'Allows user to create the task in the inventory module.'},
    { id: 'support_import_contact', label: 'Import Support Contact', description: 'Allows user to import the contact in the support module.'}
];

export const CustomerTeamManagementPage: React.FC = () => {
    const { user: loggedInUser } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [teamUsers, setTeamUsers] = useState<User[]>([]);
    const [teamGroups, setTeamGroups] = useState<UserGroup[]>([]);
    const [activeTab, setActiveTab] = useState('users'); // 'users' or 'groups'

    const [groupSearchTerm, setGroupSearchTerm] = useState('');

    const [isGroupFormOpen, setIsGroupFormOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<UserGroup | null>(null);
    const [groupFormData, setGroupFormData] = useState<{ name: string; roles: string[] }>({
        name: '', roles: [],
    });

    const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [deleteUserConfirmationText, setDeleteUserConfirmationText] = useState('');
    
    const [isDeleteGroupModalOpen, setIsDeleteGroupModalOpen] = useState(false);
    const [groupToDelete, setGroupToDelete] = useState<UserGroup | null>(null);

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [userForPasswordChange, setUserForPasswordChange] = useState<User | null>(null);
    const [newPasswordState, setNewPasswordState] = useState({ newPassword: '', confirmNewPassword: '' });


    // Determine the user whose team we are managing
    const viewAsUserId = searchParams.get('viewAsUser');
    const effectiveUser = useMemo(() => {
        if (viewAsUserId && (loggedInUser?.role === 'admin' || loggedInUser?.role === 'reseller')) {
            return getMockUserById(viewAsUserId);
        }
        return loggedInUser;
    }, [viewAsUserId, loggedInUser]);

    useEffect(() => {
        if (effectiveUser) {
            setTeamUsers(getUsersForTeam(effectiveUser.id));
            setTeamGroups(getGroupsForTeam(effectiveUser.id));
        } else {
            setTeamUsers([]);
            setTeamGroups([]);
        }
    }, [effectiveUser]);

    const tabItems = [
        { id: 'users', name: 'Team Users' },
        { id: 'groups', name: 'Permission Groups' },
    ];
    
    const filteredGroups = useMemo(() => 
        teamGroups.filter(group => 
            group.name.toLowerCase().includes(groupSearchTerm.toLowerCase())
        ), 
    [teamGroups, groupSearchTerm]);

    // --- Handlers for User Management ---
    const handleOpenDeleteUserModal = (userId: string) => {
        const user = teamUsers.find(c => c.id === userId);
        if (user) {
            setUserToDelete(user);
            setDeleteUserConfirmationText('');
            setIsDeleteUserModalOpen(true);
        }
    };

    const handleCloseDeleteUserModal = () => {
        setIsDeleteUserModalOpen(false);
        setUserToDelete(null);
    };

    const handleConfirmDeleteUser = () => {
        if (userToDelete && deleteUserConfirmationText === 'DELETE') {
            setTeamUsers(prev => prev.filter(c => c.id !== userToDelete.id));
            if (MOCK_USERS[userToDelete.email]) {
                delete MOCK_USERS[userToDelete.email];
            }
            handleCloseDeleteUserModal();
        }
    };

    // --- Handlers for Password Change ---
     const handleOpenPasswordModal = (userId: string) => {
        const user = teamUsers.find(u => u.id === userId);
        if (user) {
            setUserForPasswordChange(user);
            setIsPasswordModalOpen(true);
        }
    };
    const handleClosePasswordModal = () => {
        setIsPasswordModalOpen(false);
        setUserForPasswordChange(null);
        setNewPasswordState({ newPassword: '', confirmNewPassword: '' });
    };
    const handleConfirmPasswordChange = () => {
        if (!userForPasswordChange) return;
        if (newPasswordState.newPassword.length < 8) {
            alert("Password must be at least 8 characters long.");
            return;
        }
        if (newPasswordState.newPassword !== newPasswordState.confirmNewPassword) {
            alert("Passwords do not match.");
            return;
        }
        const userInDb = MOCK_USERS[userForPasswordChange.email];
        if (userInDb) {
            userInDb.passwordHash = `hashed${newPasswordState.newPassword}`;
            alert(`Password for ${userForPasswordChange.fullName} has been changed successfully.`);
            handleClosePasswordModal();
        } else {
            alert("An error occurred while changing the password.");
        }
    };

    // --- Handlers for Group Management ---
    const handleOpenCreateGroup = () => {
        setEditingGroup(null);
        setGroupFormData({ name: '', roles: [] });
        setIsGroupFormOpen(true);
    };

    const handleOpenEditGroup = (group: UserGroup) => {
        setEditingGroup(group);
        setGroupFormData({
            name: group.name,
            roles: [...group.permissions],
        });
        setIsGroupFormOpen(true);
    };
    
    const handleOpenDeleteGroupModal = (group: UserGroup) => {
        setGroupToDelete(group);
        setIsDeleteGroupModalOpen(true);
    };

    const handleCloseDeleteGroupModal = () => {
        setIsDeleteGroupModalOpen(false);
        setGroupToDelete(null);
    };
    
    const handleConfirmDeleteGroup = () => {
        if (groupToDelete) {
            const usersInGroup = teamUsers.filter(u => u.assignedGroupId === groupToDelete.id);
            if (usersInGroup.length > 0) {
                alert(`Cannot delete group "${groupToDelete.name}" because it is assigned to ${usersInGroup.length} user(s). Please reassign them first.`);
                return;
            }
            setTeamGroups(prev => prev.filter(g => g.id !== groupToDelete.id));
            handleCloseDeleteGroupModal();
        }
    };

    const handleCancelGroupForm = () => {
        setIsGroupFormOpen(false);
        setEditingGroup(null);
    };

    const handleSaveGroup = () => {
        if (!groupFormData.name.trim() || !effectiveUser) return;
        
        if (editingGroup) { // Update existing group
            const updatedGroup = { ...editingGroup, name: groupFormData.name, permissions: groupFormData.roles };
            setTeamGroups(prev => prev.map(g => (g.id === editingGroup.id ? updatedGroup : g)));
        } else { // Create new group
            const groupToAdd: UserGroup = {
                id: uuidv4(),
                name: groupFormData.name,
                description: '', // Description removed
                permissions: groupFormData.roles,
                teamManagerId: effectiveUser.id,
            };
            setTeamGroups(prev => [...prev, groupToAdd]);
        }
        handleCancelGroupForm();
    };

    const handleRoleChange = (roleId: string, checked: boolean) => {
        setGroupFormData(prev => {
            const roles = checked
                ? [...prev.roles, roleId]
                : prev.roles.filter(r => r !== roleId);
            return { ...prev, roles };
        });
    };
    
    const GroupFormView = () => {
        const [roleSearchTerm, setRoleSearchTerm] = useState('');

        const availableRoles = useMemo(() => 
            MOCK_ROLES.filter(role => 
                !groupFormData.roles.includes(role.id) &&
                (role.label.toLowerCase().includes(roleSearchTerm.toLowerCase()) || 
                 role.description.toLowerCase().includes(roleSearchTerm.toLowerCase()))
            ), 
        [roleSearchTerm, groupFormData.roles]);
        
        const selectedRolesDetails = useMemo(() => 
            groupFormData.roles
                .map(roleId => MOCK_ROLES.find(r => r.id === roleId))
                .filter(Boolean) as (typeof MOCK_ROLES[0])[], 
        [groupFormData.roles]);

        return (
            <Card title={editingGroup ? 'Edit Permission Group' : 'Create New Permission Group'}>
                <div className="space-y-6">
                    <FormField
                        id="groupName"
                        label="Group Name"
                        value={groupFormData.name}
                        onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                        required
                        placeholder="e.g., Marketing Team, Project Managers"
                        wrapperClassName="max-w-md"
                        maxLength={50}
                        hint="Maximum 50 characters."
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column: Available Roles */}
                        <div>
                            <h4 className="text-md font-semibold text-[#293c51] dark:text-gray-200 mb-2">Available Roles</h4>
                            <FormField 
                                id="role-search"
                                label=""
                                placeholder="Search roles..."
                                value={roleSearchTerm}
                                onChange={(e) => setRoleSearchTerm(e.target.value)}
                            />
                            <div className="space-y-2 max-h-80 overflow-y-auto pr-2 border rounded-lg p-3 dark:border-slate-600 mt-2">
                                {availableRoles.length > 0 ? availableRoles.map(role => (
                                    <div key={role.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                        <div>
                                            <p className="font-medium text-sm text-[#293c51] dark:text-gray-200">{role.label}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{role.description}</p>
                                        </div>
                                        <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            onClick={() => handleRoleChange(role.id, true)}
                                            title={`Add ${role.label}`}
                                        >
                                            <Icon name="fas fa-plus-circle" className="text-green-500"/>
                                        </Button>
                                    </div>
                                )) : (
                                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
                                        {roleSearchTerm ? 'No matching roles found.' : 'All roles have been selected.'}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Selected Roles */}
                        <div>
                            <h4 className="text-md font-semibold text-[#293c51] dark:text-gray-200 mb-2">
                                Selected Roles ({selectedRolesDetails.length})
                            </h4>
                            <div className="space-y-2 max-h-[365px] overflow-y-auto pr-2 border rounded-lg p-3 dark:border-slate-600">
                                {selectedRolesDetails.length > 0 ? selectedRolesDetails.map(role => (
                                    <div key={role.id} className="flex items-center justify-between p-2 rounded-md bg-gray-50 dark:bg-slate-700/50">
                                        <div>
                                            <p className="font-medium text-sm text-[#293c51] dark:text-gray-200">{role.label}</p>
                                        </div>
                                        <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            onClick={() => handleRoleChange(role.id, false)}
                                            title={`Remove ${role.label}`}
                                        >
                                            <Icon name="fas fa-times-circle" className="text-red-500"/>
                                        </Button>
                                    </div>
                                )) : (
                                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">Select roles from the left to add them here.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 mt-6 pt-4 border-t dark:border-gray-700">
                        <Button variant="ghost" onClick={handleCancelGroupForm}>Cancel</Button>
                        <Button onClick={handleSaveGroup} disabled={!groupFormData.name.trim()}>
                            {editingGroup ? 'Save Changes' : 'Save Group'}
                        </Button>
                    </div>
                </div>
            </Card>
        );
    };

    return (
        <>
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
                    {activeTab === 'users' && (
                        <Card title={`Team Users for ${effectiveUser?.companyName || 'Your Team'}`} titleActions={<Button leftIconName="fas fa-user-plus" onClick={() => navigate('/app/team-management/add')}>Add User</Button>}>
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white dark:bg-slate-800">
                                    <thead className="bg-gray-50 dark:bg-slate-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Full Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Group</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {teamUsers.length > 0 ? teamUsers.map(u => (
                                            <tr key={u.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#293c51] dark:text-white">{u.fullName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{u.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{teamGroups.find(g => g.id === u.assignedGroupId)?.name || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end space-x-1">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => handleOpenPasswordModal(u.id)}
                                                            title="Change Password"
                                                        >
                                                            <Icon name="fas fa-key" className="text-gray-500 hover:text-[#679a41] dark:text-gray-400 dark:hover:text-emerald-400" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => navigate(`/app/team-management/edit/${u.id}`)}
                                                            title="Edit User"
                                                        >
                                                            <Icon name="fas fa-pencil-alt" className="text-gray-500 hover:text-[#679a41] dark:text-gray-400 dark:hover:text-emerald-400" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => handleOpenDeleteUserModal(u.id)}
                                                            title="Delete User"
                                                        >
                                                            <Icon name="fas fa-trash-alt" className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="text-center py-6 text-gray-500 dark:text-gray-400">
                                                No team users found for this customer.
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'groups' && (
                        isGroupFormOpen ? <GroupFormView /> : (
                            <Card title="Permission Groups" titleActions={<Button leftIconName="fas fa-plus-circle" onClick={handleOpenCreateGroup}>Create Group</Button>}>
                                <div className="mb-4 max-w-sm">
                                    <FormField 
                                        id="group-search"
                                        label=""
                                        placeholder="Search groups..."
                                        value={groupSearchTerm}
                                        onChange={(e) => setGroupSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white dark:bg-slate-800">
                                        <thead className="bg-gray-50 dark:bg-slate-700">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Group Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Assigned Users</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Roles Count</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {filteredGroups.length > 0 ? filteredGroups.map(group => (
                                                <tr key={group.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#293c51] dark:text-white">{group.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{teamUsers.filter(u => u.assignedGroupId === group.id).length}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{group.permissions.length}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center justify-end space-x-1">
                                                            <Button size="sm" variant="outline" onClick={() => handleOpenEditGroup(group)}>Edit Group</Button>
                                                            <Button size="icon" variant="ghost" onClick={() => handleOpenDeleteGroupModal(group)} title="Delete Group">
                                                                <Icon name="fas fa-trash-alt" className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500"/>
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={4} className="text-center py-6 text-gray-500 dark:text-gray-400">
                                                        {groupSearchTerm ? 'No groups match your search.' : 'No groups have been created.'}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        )
                    )}
                </div>
            </div>

            {userToDelete && (
                 <Modal 
                    isOpen={isDeleteUserModalOpen} 
                    onClose={handleCloseDeleteUserModal}
                    title={`Delete Team User: ${userToDelete.fullName}`}
                    size="md"
                    footer={
                        <>
                            <Button 
                                variant="danger" 
                                onClick={handleConfirmDeleteUser}
                                disabled={deleteUserConfirmationText !== 'DELETE'}
                            >
                                Delete User
                            </Button>
                            <Button variant="ghost" onClick={handleCloseDeleteUserModal}>Cancel</Button>
                        </>
                    }
                >
                    <div className="space-y-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            This action is permanent and cannot be undone. You are about to delete the team user account for 
                            <strong className="text-red-600 dark:text-red-400"> {userToDelete.fullName} ({userToDelete.email})</strong>.
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                           To confirm, please type <strong className="font-mono text-[#293c51] dark:text-gray-200">DELETE</strong> in the box below.
                        </p>
                        <FormField
                            id="delete-confirm-team-user"
                            label=""
                            value={deleteUserConfirmationText}
                            onChange={(e) => setDeleteUserConfirmationText(e.target.value)}
                            placeholder="Type DELETE to confirm"
                            inputClassName="text-center tracking-widest"
                        />
                    </div>
                </Modal>
            )}

            {groupToDelete && (
                 <Modal 
                    isOpen={isDeleteGroupModalOpen} 
                    onClose={handleCloseDeleteGroupModal}
                    title={`Delete Permission Group: ${groupToDelete.name}`}
                    size="md"
                    footer={
                        <>
                            <Button variant="danger" onClick={handleConfirmDeleteGroup}>
                                Yes, Delete Group
                            </Button>
                            <Button variant="ghost" onClick={handleCloseDeleteGroupModal}>Cancel</Button>
                        </>
                    }
                >
                    <div className="space-y-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            Are you sure you want to delete the permission group 
                            <strong className="text-red-600 dark:text-red-400"> {groupToDelete.name}</strong>?
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                           This action is permanent and cannot be undone.
                        </p>
                    </div>
                </Modal>
            )}

            {userForPasswordChange && (
                <Modal 
                    isOpen={isPasswordModalOpen} 
                    onClose={handleClosePasswordModal}
                    title={`Change Password for ${userForPasswordChange.fullName}`}
                    size="md"
                    footer={
                        <>
                            <Button onClick={handleConfirmPasswordChange}>Save New Password</Button>
                            <Button variant="ghost" onClick={handleClosePasswordModal}>Cancel</Button>
                        </>
                    }
                >
                    <div className="space-y-4">
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/40 border-l-4 border-yellow-400 dark:border-yellow-500 rounded-r-lg">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                <Icon name="fas fa-exclamation-triangle" className="mr-2"/>
                                You are about to reset the password for this user. They will be required to use the new password to log in. This action cannot be undone.
                            </p>
                        </div>
                        <FormField
                            id="newPassword"
                            name="newPassword"
                            label="New Password"
                            type="password"
                            value={newPasswordState.newPassword}
                            onChange={(e) => setNewPasswordState(s => ({ ...s, newPassword: e.target.value }))}
                            showPasswordToggle
                        />
                        <FormField
                            id="confirmNewPassword"
                            name="confirmNewPassword"
                            label="Confirm New Password"
                            type="password"
                            value={newPasswordState.confirmNewPassword}
                            onChange={(e) => setNewPasswordState(s => ({ ...s, confirmNewPassword: e.target.value }))}
                            showPasswordToggle
                        />
                    </div>
                </Modal>
            )}
        </>
    );
};