
import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, FormField, SearchableSelect, Icon } from '@/components/ui';
import { getAllMockCustomers, mockSupportTickets } from '@/data';
import type { User, SupportTicket, SupportTicketPriority, SupportTicketDepartment, SupportTicketRequestType } from '@/types';

export const CreateTicketPage: React.FC = () => {
    const navigate = useNavigate();
    const [allCustomers] = useState<User[]>(getAllMockCustomers);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        requestType: 'Incident' as SupportTicketRequestType,
        priority: 'Medium' as SupportTicketPriority,
        customerId: '',
        subject: '',
        department: 'Technical Support' as SupportTicketDepartment,
        description: '',
    });
    const [attachments, setAttachments] = useState<File[]>([]);
    
    const customerOptions = useMemo(() => 
        allCustomers.map(c => ({ value: c.id, label: `${c.fullName} (${c.companyName})` })),
        [allCustomers]
    );

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCustomerChange = (customerId: string) => {
        setFormData(prev => ({ ...prev, customerId }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachments(prev => [...prev, ...Array.from(e.target.files)]);
        }
    };
    
    const removeAttachment = (fileName: string) => {
        setAttachments(prev => prev.filter(file => file.name !== fileName));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const customer = allCustomers.find(c => c.id === formData.customerId);
        if (!customer) {
            alert("Selected customer not found. Please select a customer.");
            return;
        }

        const newTicket: SupportTicket = {
            id: `TKT-${Math.floor(Math.random() * 90000) + 10000}`,
            subject: formData.subject,
            product: 'General Inquiry',
            status: 'Open',
            lastUpdate: new Date().toISOString(),
            description: formData.description,
            customerId: formData.customerId,
            customerName: customer.fullName,
            priority: formData.priority,
            department: formData.department,
            requestType: formData.requestType,
            attachments: attachments.map(file => ({
                name: file.name,
                type: file.type,
                size: file.size,
                dataUrl: '', 
            })),
        };

        mockSupportTickets.unshift(newTicket);
        alert('Support ticket created successfully!');
        navigate('/app/admin/support');
    };

    const isSubmitDisabled = !formData.customerId || !formData.subject || !formData.description;

    return (
        <Card title="Create New Support Ticket">
            <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        id="requestType"
                        name="requestType"
                        label="Request Type"
                        as="select"
                        value={formData.requestType}
                        onChange={handleFormChange}
                        required
                    >
                        <option value="Incident">Incident</option>
                        <option value="Question">Question</option>
                        <option value="Problem">Problem</option>
                        <option value="Feature Request">Feature Request</option>
                    </FormField>
                    <FormField
                        id="priority"
                        name="priority"
                        label="Priority"
                        as="select"
                        value={formData.priority}
                        onChange={handleFormChange}
                        required
                    >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                    </FormField>
                </div>

                <SearchableSelect
                    id="customerId"
                    label="Customer"
                    options={customerOptions}
                    value={formData.customerId}
                    onChange={handleCustomerChange}
                    placeholder="Search and select a customer..."
                />
                
                <FormField
                    id="department"
                    name="department"
                    label="Department"
                    as="select"
                    value={formData.department}
                    onChange={handleFormChange}
                    required
                >
                    <option value="Technical Support">Technical Support</option>
                    <option value="Billing Department">Billing Department</option>
                    <option value="Sales Inquiry">Sales Inquiry</option>
                </FormField>
                
                <FormField
                    id="subject"
                    name="subject"
                    label="Subject"
                    value={formData.subject}
                    onChange={handleFormChange}
                    placeholder="Enter a brief summary of the issue"
                    required
                />

                <FormField
                    id="description"
                    name="description"
                    label="Description"
                    as="textarea"
                    rows={6}
                    value={formData.description}
                    onChange={handleFormChange}
                    placeholder="Provide a detailed description of the issue or request..."
                    required
                />
                
                <div>
                    <label className="block text-sm font-medium mb-1 text-[#293c51] dark:text-gray-300">Attachments</label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        leftIconName="fas fa-paperclip"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        Attach Files
                    </Button>
                    <input
                        type="file"
                        multiple
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                     {attachments.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {attachments.map((file, i) => (
                                <div key={i} className="flex items-center bg-gray-200 dark:bg-slate-600 rounded-full px-3 py-1 text-sm">
                                    <Icon name="fas fa-file" className="mr-2 text-gray-500 dark:text-gray-400" />
                                    <span>{file.name}</span>
                                    <span className="text-gray-500 dark:text-gray-400 mx-1">-</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024).toFixed(1)} KB</span>
                                    <button onClick={() => removeAttachment(file.name)} className="ml-2 text-red-500 hover:text-red-700">
                                        <Icon name="fas fa-times-circle" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t dark:border-gray-700">
                    <Button type="button" variant="ghost" onClick={() => navigate('/app/admin/support')}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitDisabled}>
                        Create Ticket
                    </Button>
                </div>
            </form>
        </Card>
    );
};
