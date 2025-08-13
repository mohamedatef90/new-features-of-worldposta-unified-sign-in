
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/context';
import { getGroupsForTeam, MOCK_USERS } from '@/data';
import type { User, UserGroup, AddedResource } from '@/types';
import { Card, Button, FormField, Modal, Icon, MultiSelectDropdown } from '@/components/ui';

const mockPostaPackages = [
    { id: 'posta-basic', name: 'Posta Basic Plan' },
    { id: 'posta-standard', name: 'Posta Standard Plan' },
    { id: 'posta-premium', name: 'Posta Premium Plan' },
];
const mockCloudEdgePackages = [
    { id: 'cloudedge-s1', name: 'CloudEdge Small Instance' },
    { id: 'cloudedge-m1', name: 'CloudEdge Medium Instance' },
    { id: 'cloudedge-l1', name: 'CloudEdge Large Instance' },
];
const mockOrganizations = [
    { id: 'org-alpha', name: 'Alpha Inc.' },
    { id: 'org-beta', name: 'Beta Division' },
];
const mockDomains = [
    { id: 'dom-alpha', name: 'alpha-inc.com' },
    { id: 'dom-beta', name: 'betadivision.net' },
    { id: 'dom-gamma', name: 'gamma-corp.io' },
];

export const EditTeamUserPage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const { user: managerUser } = useAuth();
    const navigate = useNavigate();
    
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [teamGroups, setTeamGroups] = useState<UserGroup[]>([]);
    
    const allPackages = useMemo(() => [...mockPostaPackages, ...mockCloudEdgePackages], []);

    interface EditTeamMemberForm {
      fullName: string;
      email: string;
      newPassword: string;
      displayName: string;
      assignedGroupId: string;
      phoneNumber: string;
      enableMfa: boolean;
    }

    const initialFormState: EditTeamMemberForm = {
      fullName: '',
      email: '',
      newPassword: '',
      displayName: '',
      assignedGroupId: '',
      phoneNumber: '',
      enableMfa: false,
    };

    const [formState, setFormState] = useState<EditTeamMemberForm>(initialFormState);
    const [isResourcesModalOpen, setIsResourcesModalOpen] = useState(false);
    const [addedResources, setAddedResources] = useState<AddedResource[]>([]);
    
    const initialResourceFormState = { productId: 'posta', packageId: '', organizationId: '', domainIds: [] as string[] };
    const [resourceForm, setResourceForm] = useState(initialResourceFormState);

    useEffect(() => {
        const userToEdit = Object.values(MOCK_USERS).find(u => u.id === userId);
        if (userToEdit) {
            setEditingUser(userToEdit);
            setFormState({
                fullName: userToEdit.fullName,
                email: userToEdit.email,
                newPassword: '',
                displayName: userToEdit.displayName || '',
                assignedGroupId: userToEdit.assignedGroupId || '',
                phoneNumber: userToEdit.phoneNumber || '',
                enableMfa: false, // This would typically come from the user object
            });
            // In a real app, you would fetch and set the user's existing resources here.
            // setAddedResources(fetchUserResources(userId));
        } else {
            alert('User not found.');
            navigate('/app/team-management');
        }
    }, [userId, navigate]);

    useEffect(() => {
        if (managerUser) {
            const groups = getGroupsForTeam(managerUser.id);
            setTeamGroups(groups);
        }
    }, [managerUser]);

    useEffect(() => {
        if (!isResourcesModalOpen) {
            setResourceForm(initialResourceFormState);
        }
    }, [isResourcesModalOpen]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormState(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
    
    const handleResourceFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setResourceForm(prev => {
            const newState = { ...prev, [name]: value };
            if (name === 'productId') {
                newState.packageId = '';
                newState.organizationId = '';
                newState.domainIds = [];
            }
            return newState;
        });
    };

    const handleDomainChange = (selectedDomainIds: string[]) => {
        setResourceForm(prev => ({ ...prev, domainIds: selectedDomainIds }));
    };
    
    const handleAddResource = () => {
        if (!resourceForm.productId || !resourceForm.packageId) {
            alert("Please select a product and a package.");
            return;
        }
        setAddedResources(prev => [...prev, { id: uuidv4(), ...resourceForm }]);
        setIsResourcesModalOpen(false);
    };

    const handleRemoveResource = (id: string) => {
        setAddedResources(prev => prev.filter(res => res.id !== id));
    };
    
    const handleUpdateUser = () => {
        if (!editingUser) return;

        const userInDb = MOCK_USERS[editingUser.email];
        if (userInDb) {
            userInDb.displayName = formState.displayName;
            userInDb.phoneNumber = formState.phoneNumber;
            userInDb.assignedGroupId = formState.assignedGroupId;
            
            if (formState.newPassword) {
                userInDb.passwordHash = `hashed${formState.newPassword}`;
            }

            console.log(`User ${editingUser.email} updated.`);
            console.log("Updated assigned resources:", addedResources);
            
            alert('User updated successfully!');
            navigate('/app/team-management');
        }
    };

    const isSaveChangesDisabled = !formState.displayName || !formState.assignedGroupId;
    const availablePackages = resourceForm.productId === 'posta' ? mockPostaPackages : mockCloudEdgePackages;

    if (!editingUser) {
        return <div className="text-center p-8">Loading user data...</div>;
    }

    return (
        <>
            <Card title="Edit Team User">
                <form className="space-y-4 max-w-2xl mx-auto" onSubmit={(e) => { e.preventDefault(); handleUpdateUser(); }}>
                    <FormField id="fullName" name="fullName" label="Name" value={formState.fullName} onChange={handleFormChange} disabled />
                    <FormField id="email" name="email" label="Email" type="email" value={formState.email} onChange={handleFormChange} disabled />
                    <FormField id="displayName" name="displayName" label="User Name" value={formState.displayName} onChange={handleFormChange} required placeholder="e.g. johndoe"/>
                    <FormField id="newPassword" name="newPassword" label="New Password" type="password" value={formState.newPassword} onChange={handleFormChange} showPasswordToggle hint="Leave blank to keep the current password."/>
                    <FormField id="phoneNumber" name="phoneNumber" label="Phone Number" type="tel" value={formState.phoneNumber} onChange={handleFormChange}/>
                    <FormField
                        id="assignedGroupId"
                        name="assignedGroupId"
                        label="Permissions Group"
                        as="select"
                        value={formState.assignedGroupId}
                        onChange={handleFormChange}
                        required
                    >
                        <option value="">Select a group</option>
                        {teamGroups.map(group => (
                            <option key={group.id} value={group.id}>{group.name}</option>
                        ))}
                    </FormField>
                    
                    <div className="pt-2">
                        <FormField
                            type="checkbox"
                            id="enableMfa"
                            name="enableMfa"
                            label="Enable Multi-Factor Authentication (MFA) for this user"
                            checked={formState.enableMfa}
                            onChange={handleFormChange}
                        />
                    </div>
                    
                    <hr className="dark:border-gray-700"/>
                    
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-md font-semibold text-[#293c51] dark:text-gray-200">Assigned Resources</h4>
                            <Button type="button" variant="outline" size="sm" onClick={() => setIsResourcesModalOpen(true)} leftIconName="fas fa-plus">
                                Add Resource
                            </Button>
                        </div>
                        
                        {addedResources.length > 0 ? (
                            <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50 dark:bg-slate-700">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Product</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Package</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Organization</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Domains</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {addedResources.map(res => (
                                            <tr key={res.id}>
                                                <td className="px-4 py-2 text-sm capitalize">{res.productId}</td>
                                                <td className="px-4 py-2 text-sm">{(allPackages.find(p => p.id === res.packageId)?.name) || 'N/A'}</td>
                                                <td className="px-4 py-2 text-sm">{(mockOrganizations.find(o => o.id === res.organizationId)?.name) || 'N/A'}</td>
                                                <td className="px-4 py-2 text-sm">
                                                    {res.domainIds.length > 0
                                                        ? res.domainIds.map(id => mockDomains.find(d => d.id === id)?.name).join(', ')
                                                        : 'N/A'
                                                    }
                                                </td>
                                                <td className="px-4 py-2 text-right">
                                                    <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveResource(res.id)} title="Remove Resource">
                                                        <Icon name="fas fa-trash-alt" className="text-red-500"/>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-4 border-2 border-dashed rounded-lg dark:border-gray-600">
                                <p className="text-sm text-gray-500 dark:text-gray-400">No resources assigned to this user yet.</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex justify-end space-x-2 mt-6 pt-4 border-t dark:border-gray-700">
                        <Button type="button" variant="ghost" onClick={() => navigate('/app/team-management')}>Cancel</Button>
                        <Button type="submit" disabled={isSaveChangesDisabled}>Save Changes</Button>
                    </div>
                </form>
            </Card>

            <Modal
                isOpen={isResourcesModalOpen}
                onClose={() => setIsResourcesModalOpen(false)}
                title="Add Resources to User"
                size="lg"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsResourcesModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddResource} disabled={!resourceForm.packageId}>Add</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <FormField
                        id="productId"
                        name="productId"
                        label="Product"
                        as="select"
                        value={resourceForm.productId}
                        onChange={handleResourceFormChange}
                        required
                    >
                        <option value="posta">Posta</option>
                        <option value="cloudedge">CloudEdge</option>
                    </FormField>
                    <FormField
                        id="packageId"
                        name="packageId"
                        label="Package"
                        as="select"
                        value={resourceForm.packageId}
                        onChange={handleResourceFormChange}
                        required
                    >
                        <option value="">-- Select a package --</option>
                        {availablePackages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </FormField>
                    <FormField
                        id="organizationId"
                        name="organizationId"
                        label="Organization"
                        as="select"
                        value={resourceForm.organizationId}
                        onChange={handleResourceFormChange}
                    >
                        <option value="">-- Select an organization (optional) --</option>
                        {mockOrganizations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </FormField>
                    {resourceForm.productId === 'posta' && (
                       <MultiSelectDropdown
                            id="domains"
                            label="Domains (optional)"
                            options={mockDomains.map(d => ({ value: d.id, label: d.name }))}
                            selected={resourceForm.domainIds}
                            onChange={handleDomainChange}
                            placeholder="Select domains..."
                        />
                    )}
                </div>
            </Modal>
        </>
    );
};
