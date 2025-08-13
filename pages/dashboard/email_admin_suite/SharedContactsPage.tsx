
import React, { useState, useMemo, useEffect } from 'react';
import { Card, Button, FormField, Icon, Pagination, Modal } from '@/components/ui';
import type { SharedContact } from '@/types';
import { mockSharedContacts } from '@/data';
import { v4 as uuidv4 } from 'uuid';

// --- SHARED CONTACTS VIEW ---

interface ContactFilters {
    displayName: string;
    dateFrom: string;
    dateTo: string;
}

const initialFilters: ContactFilters = {
    displayName: '',
    dateFrom: '',
    dateTo: '',
};

// Filter Panel Component
const FilterPanel: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: ContactFilters) => void;
    onClear: () => void;
    currentFilters: ContactFilters;
}> = ({ isOpen, onClose, onApply, onClear, currentFilters }) => {
    const [localFilters, setLocalFilters] = useState<ContactFilters>(currentFilters);
    useEffect(() => { if (isOpen) setLocalFilters(currentFilters); }, [isOpen, currentFilters]);
    const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => setLocalFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleApply = () => { onApply(localFilters); onClose(); };
    const handleClear = () => { onClear(); onClose(); };

    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black/60 z-[59]" onClick={onClose} aria-hidden="true" />}
            <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-[#f8f8f8] dark:bg-slate-800 border-l dark:border-slate-700 z-[60] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold">Filter Shared Contacts</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"><Icon name="fas fa-times" /></button>
                </div>
                <div className="flex-grow p-6 space-y-4">
                    <FormField id="displayName" name="displayName" label="Display Name / Email" value={localFilters.displayName} onChange={handleLocalChange} placeholder="Search by name or email..." />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField id="dateFrom" name="dateFrom" label="From" type="date" value={localFilters.dateFrom} onChange={handleLocalChange} />
                        <FormField id="dateTo" name="dateTo" label="To" type="date" value={localFilters.dateTo} onChange={handleLocalChange} />
                    </div>
                </div>
                <div className="flex-shrink-0 p-4 border-t bg-white dark:bg-slate-800 dark:border-slate-700 flex justify-end gap-2">
                    <Button variant="ghost" onClick={handleClear}>Clear</Button>
                    <Button onClick={handleApply}>Apply</Button>
                </div>
            </div>
        </>
    );
};

// Add/Edit Panel Component
const AddEditContactPanel: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (contact: SharedContact) => void;
    contactToEdit: SharedContact | null;
}> = ({ isOpen, onClose, onSave, contactToEdit }) => {
    const initialForm = { displayName: '', email: '' };
    const [form, setForm] = useState(initialForm);

    useEffect(() => {
        if (isOpen) {
            if (contactToEdit) {
                setForm({ displayName: contactToEdit.displayName, email: contactToEdit.email });
            } else {
                setForm(initialForm);
            }
        }
    }, [contactToEdit, isOpen]);

    const handleSubmit = () => {
        if (!form.displayName || !form.email) {
            alert("Display Name and Email Address are required.");
            return;
        }
        const newContact: SharedContact = {
            id: contactToEdit?.id || uuidv4(),
            displayName: form.displayName,
            email: form.email,
            creationDate: contactToEdit?.creationDate || new Date().toISOString(),
        };
        onSave(newContact);
    };

    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black/60 z-[59]" onClick={onClose} aria-hidden="true" />}
            <div className={`fixed top-0 right-0 h-full w-full max-w-lg bg-[#f8f8f8] dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 z-[60] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold">{contactToEdit ? 'Edit' : 'Add'} Shared Contact</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"><Icon name="fas fa-times" /></button>
                </div>
                <div className="flex-grow p-6 space-y-4">
                    <FormField id="displayName" name="displayName" label="Display Name" value={form.displayName} onChange={(e) => setForm({...form, displayName: e.target.value})} required />
                    <FormField id="email" name="email" label="Email Address" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
                </div>
                <div className="flex-shrink-0 p-4 border-t bg-white dark:bg-slate-800 dark:border-slate-700 flex justify-end gap-2">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Save</Button>
                </div>
            </div>
        </>
    );
};

// Main Page Component
export const SharedContactsPage: React.FC = () => {
    const [contacts, setContacts] = useState<SharedContact[]>(mockSharedContacts);
    const [filters, setFilters] = useState<ContactFilters>(initialFilters);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<SharedContact | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [contactToDelete, setContactToDelete] = useState<SharedContact | null>(null);

    const filteredContacts = useMemo(() => {
        return contacts.filter(contact => {
            const searchTerm = filters.displayName.toLowerCase();
            if (filters.displayName && !contact.displayName.toLowerCase().includes(searchTerm) && !contact.email.toLowerCase().includes(searchTerm)) return false;
            
            const creationDate = new Date(contact.creationDate);
            if (filters.dateFrom && creationDate < new Date(filters.dateFrom)) return false;
            if (filters.dateTo) {
                const toDate = new Date(filters.dateTo);
                toDate.setHours(23, 59, 59, 999);
                if (creationDate > toDate) return false;
            }
            return true;
        }).sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
    }, [contacts, filters]);

    const paginatedContacts = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        return filteredContacts.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredContacts, currentPage, rowsPerPage]);

    useEffect(() => { setCurrentPage(1); }, [filters, rowsPerPage]);

    const handleOpenAddPanel = () => {
        setEditingContact(null);
        setIsAddPanelOpen(true);
    };

    const handleOpenEditPanel = (contact: SharedContact) => {
        setEditingContact(contact);
        setIsAddPanelOpen(true);
    };

    const handleSaveContact = (contact: SharedContact) => {
        if (editingContact) {
            setContacts(prev => prev.map(c => c.id === contact.id ? contact : c));
        } else {
            setContacts(prev => [contact, ...prev]);
        }
        setIsAddPanelOpen(false);
    };

    const handleOpenDeleteModal = (contact: SharedContact) => {
        setContactToDelete(contact);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (contactToDelete) {
            setContacts(prev => prev.filter(c => c.id !== contactToDelete.id));
            setIsDeleteModalOpen(false);
            setContactToDelete(null);
        }
    };
    
    const handleExport = () => {
        const headers = ["Display Name", "Email", "Creation Date"];
        const rows = filteredContacts.map(contact => [
            `"${contact.displayName.replace(/"/g, '""')}"`,
            `"${contact.email}"`,
            `"${new Date(contact.creationDate).toISOString()}"`
        ].join(','));
        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "shared_contacts.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <>
            <Card title="Shared Contacts" titleActions={
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setIsFilterPanelOpen(true)} leftIconName="fas fa-filter">Filters & Search</Button>
                    <Button variant="outline" onClick={handleExport} leftIconName="fas fa-download">Download</Button>
                    <Button leftIconName="fas fa-plus-circle" onClick={handleOpenAddPanel}>Add Contact</Button>
                </div>
            }>
                <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Display Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {paginatedContacts.map(contact => (
                                <tr key={contact.id}>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">{contact.displayName}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">{contact.email}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                                        <div className="flex justify-end items-center space-x-1">
                                            <Button size="icon" variant="ghost" title="Edit" onClick={() => handleOpenEditPanel(contact)}><Icon name="fas fa-pencil-alt" /></Button>
                                            <Button size="icon" variant="ghost" title="Delete" onClick={() => handleOpenDeleteModal(contact)}><Icon name="fas fa-trash-alt" className="text-red-500" /></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                             {paginatedContacts.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="text-center py-6 text-gray-500 dark:text-gray-400">
                                        No shared contacts found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <Pagination currentPage={currentPage} totalItems={filteredContacts.length} itemsPerPage={rowsPerPage} onPageChange={setCurrentPage} onItemsPerPageChange={setRowsPerPage} />
                </div>
            </Card>

            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Contact" footer={<><Button variant="danger" onClick={handleConfirmDelete}>Delete</Button><Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button></>}>
                <p>Are you sure you want to delete the contact <strong>{contactToDelete?.displayName}</strong>? This action cannot be undone.</p>
            </Modal>
            
            <FilterPanel isOpen={isFilterPanelOpen} onClose={() => setIsFilterPanelOpen(false)} onApply={setFilters} onClear={() => setFilters(initialFilters)} currentFilters={filters} />
            <AddEditContactPanel isOpen={isAddPanelOpen} onClose={() => setIsAddPanelOpen(false)} onSave={handleSaveContact} contactToEdit={editingContact} />
        </>
    );
};
