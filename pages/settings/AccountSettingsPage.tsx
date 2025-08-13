


import React, { useState, useRef } from 'react';
import { useAuth } from '@/context';
import { Card, FormField, Button, Icon } from '@/components/ui';

export const AccountSettingsPage: React.FC = () => {
    const { user, updateProfile, isLoading, changePassword } = useAuth();
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [formState, setFormState] = useState({
        fullName: user?.fullName || '',
        displayName: user?.displayName || '',
        email: user?.email || '',
        companyName: user?.companyName || '',
        phoneNumber: user?.phoneNumber || ''
    });
     const [passState, setPassState] = useState({ oldPassword: '', newPassword: '', confirmNewPassword: '' });

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handlePassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassState({ ...passState, [e.target.name]: e.target.value });
    };
    
    const handleInfoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { email, ...updateData } = formState; // exclude email
        
        const finalUpdateData: Parameters<typeof updateProfile>[0] = updateData;

        if (avatarPreview) {
            finalUpdateData.avatarUrl = avatarPreview;
        }

        updateProfile(finalUpdateData).then(() => {
            setAvatarPreview(null); // Reset preview on success
        });
    };

    const handlePassSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (passState.newPassword !== passState.confirmNewPassword) {
            alert("New passwords do not match.");
            return;
        }
        changePassword(passState.oldPassword, passState.newPassword);
        setPassState({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
    };


    return (
        <div className="space-y-6">
            <Card title="Account Information">
                <form onSubmit={handleInfoSubmit}>
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Avatar Section */}
                        <div className="w-full md:w-auto flex flex-col items-center flex-shrink-0">
                            <div className="relative group w-32 h-32">
                                <img
                                    src={avatarPreview || user?.avatarUrl || `https://i.pravatar.cc/150?u=${user?.id}`}
                                    alt="Profile Avatar"
                                    className="w-full h-full rounded-full object-cover border-4 border-gray-200 dark:border-gray-600"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-full transition-opacity cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#679a41]"
                                    aria-label="Change profile picture"
                                >
                                    <Icon name="fas fa-camera" className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png, image/jpeg, image/gif"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                            <p className="text-xs text-gray-500 mt-2">Click image to change</p>
                        </div>

                        {/* Form Fields Section */}
                        <div className="flex-grow w-full space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField id="fullName" name="fullName" label="Full Name" value={formState.fullName} onChange={handleInfoChange} />
                                <FormField id="displayName" name="displayName" label="Display Name" value={formState.displayName} onChange={handleInfoChange} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField id="email" name="email" label="Email" value={formState.email} onChange={handleInfoChange} disabled />
                                <FormField id="companyName" name="companyName" label="Company Name" value={formState.companyName} onChange={handleInfoChange} />
                            </div>
                            <FormField id="phoneNumber" name="phoneNumber" label="Phone Number" type="tel" value={formState.phoneNumber} onChange={handleInfoChange} />
                        </div>
                    </div>
                     <div className="flex justify-end pt-4 mt-4 border-t dark:border-gray-700">
                         <Button type="submit" isLoading={isLoading}>Save Changes</Button>
                     </div>
                </form>
            </Card>
            <Card title="Change Password">
                 <form onSubmit={handlePassSubmit} className="space-y-4">
                    <FormField id="oldPassword" name="oldPassword" label="Old Password" type="password" value={passState.oldPassword} onChange={handlePassChange} showPasswordToggle/>
                    <FormField id="newPassword" name="newPassword" label="New Password" type="password" value={passState.newPassword} onChange={handlePassChange} showPasswordToggle/>
                    <FormField id="confirmNewPassword" name="confirmNewPassword" label="Confirm New Password" type="password" value={passState.confirmNewPassword} onChange={handlePassChange} showPasswordToggle/>
                    <div className="flex justify-end">
                         <Button type="submit" isLoading={isLoading}>Change Password</Button>
                     </div>
                </form>
            </Card>
        </div>
    );
};