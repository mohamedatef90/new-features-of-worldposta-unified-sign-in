
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Card, Button, FormField } from '@/components/ui';
import { MOCK_USERS } from '@/data';
import type { User } from '@/types';

const countries = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
];

export const AddCustomerPage: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        customerName: '',
        customerInternalName: '',
        userName: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        country: 'US',
        city: '',
        state: '',
        address: '',
        contactType: 'email' as 'email' | 'phone' | 'mobile',
        contactTitle: '',
        contactName: '',
        isVip: false,
        useHtmlEmail: true,
        isDemo: false,
        isSignup: false,
        runAutomaticAlerts: true,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const newUser: User = {
            id: uuidv4(),
            fullName: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            companyName: formData.customerName,
            role: 'customer',
            status: 'active',
            displayName: formData.userName,
        };

        MOCK_USERS[newUser.email.toLowerCase()] = { ...newUser, passwordHash: `hashed${formData.password}` };

        alert('New customer added successfully!');
        navigate('/app/admin/users');
    };

    return (
        <Card title="Add New Customer">
            <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField id="customerName" name="customerName" label="Customer Name" value={formData.customerName} onChange={handleChange} required />
                        <FormField id="customerInternalName" name="customerInternalName" label="Customer Internal Name" value={formData.customerInternalName} onChange={handleChange} />
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-[#293c51] dark:text-gray-200">Main Info</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField id="userName" name="userName" label="User Name" value={formData.userName} onChange={handleChange} required />
                            <FormField id="email" name="email" label="Email" type="email" value={formData.email} onChange={handleChange} required />
                            <FormField id="password" name="password" label="Password" type="password" value={formData.password} onChange={handleChange} required showPasswordToggle />
                            <div></div>
                            <FormField id="firstName" name="firstName" label="First Name" value={formData.firstName} onChange={handleChange} required />
                            <FormField id="lastName" name="lastName" label="Last Name" value={formData.lastName} onChange={handleChange} required />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-[#293c51] dark:text-gray-200">Location</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField as="select" id="country" name="country" label="Country" value={formData.country} onChange={handleChange}>
                                {countries.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </FormField>
                            <div></div>
                            <FormField id="city" name="city" label="City" value={formData.city} onChange={handleChange} />
                            <FormField id="state" name="state" label="State" value={formData.state} onChange={handleChange} />
                            <FormField id="address" name="address" label="Address" value={formData.address} onChange={handleChange} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-[#293c51] dark:text-gray-200">Contact Info</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField as="select" id="contactType" name="contactType" label="Contact Type" value={formData.contactType} onChange={handleChange}>
                                <option value="email">Email</option>
                                <option value="phone">Phone</option>
                                <option value="mobile">Mobile</option>
                            </FormField>
                            <div></div>
                            <FormField id="contactTitle" name="contactTitle" label="Title" value={formData.contactTitle} onChange={handleChange} />
                            <FormField id="contactName" name="contactName" label="Name" value={formData.contactName} onChange={handleChange} />
                        </div>
                    </div>

                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <FormField type="checkbox" id="isVip" name="isVip" label="VIP" checked={formData.isVip} onChange={handleChange} />
                            <FormField type="checkbox" id="useHtmlEmail" name="useHtmlEmail" label="HTML email" checked={formData.useHtmlEmail} onChange={handleChange} />
                            <FormField type="checkbox" id="isDemo" name="isDemo" label="Is Demo" checked={formData.isDemo} onChange={handleChange} />
                            <FormField type="checkbox" id="isSignup" name="isSignup" label="Is Signup" checked={formData.isSignup} onChange={handleChange} />
                            <FormField type="checkbox" id="runAutomaticAlerts" name="runAutomaticAlerts" label="Run Automatic Alerts" checked={formData.runAutomaticAlerts} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="ghost" onClick={() => navigate('/app/admin/users')}>Cancel</Button>
                        <Button type="submit">Save</Button>
                    </div>
                </form>
            </div>
        </Card>
    );
};
