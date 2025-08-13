
import React, { useState, useMemo, useEffect } from 'react';
import { Card, Button, FormField, Icon, Pagination, Modal } from '@/components/ui';
import type { DistributionList } from '@/types';
import { mockMailboxDomains, mockDistributionLists } from '@/data';
import { v4 as uuidv4 } from 'uuid';

interface DlFilters {
    displayName: string;
    domain: string;
    dateFrom: string;
    dateTo: string;
}

const initialDlFilters: DlFilters = {
    displayName: '',
    domain: 'ALL',
    dateFrom: '',
    dateTo: '',
};

const DlFilterPanel: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: DlFilters) => void;
    onClear: () => void;
    currentFilters: DlFilters;
}> = ({ isOpen, onClose, onApply, onClear, currentFilters }) => {
    const [localFilters, setLocalFilters] = useState<DlFilters>(currentFilters);
    useEffect(() => { if (isOpen) setLocalFilters(currentFilters); }, [isOpen, currentFilters]);
    const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setLocalFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleApply = () => { onApply(localFilters); onClose(); };
    const handleClear = () => { onClear(); onClose(); };

    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black/60 z-[59]" onClick={onClose} aria-hidden="true" />}
            <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-[#f8f8f8] dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 z-[60] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold">Filter Distribution Lists</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"><Icon name="fas fa-times" /></button>
                </div>
                <div className="flex-grow p-6 space-y-4">
                    <FormField id="displayName" name="displayName" label="Display Name" value={localFilters.displayName} onChange={handleLocalChange} placeholder="Search by name..." />
                    <FormField as="select" id="domain" name="domain" label="Domain" value={localFilters.domain} onChange={handleLocalChange}>
                        <option value="ALL">All Domains</option>
                        {mockMailboxDomains.map(d => <option key={d} value={d}>{d}</option>)}
                    </FormField>
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

const AddDlPanel: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (list: DistributionList) => void;
    listToEdit: DistributionList | null;
}> = ({ isOpen, onClose, onSave, listToEdit }) => {
    const initialForm = { displayName: '', emailUser: '', emailDomain: mockMailboxDomains[0], managerEmail: '' };
    const [form, setForm] = useState(initialForm);

    useEffect(() => {
        if (isOpen) {
            if (listToEdit) {
                const [user, domain] = listToEdit.primaryEmail.split('@');
                setForm({ displayName: listToEdit.displayName, emailUser: user, emailDomain: domain, managerEmail: listToEdit.managerEmail || '' });
            } else {
                setForm(initialForm);
            }
        }
    }, [listToEdit, isOpen]);

    const handleSubmit = () => {
        if (!form.displayName || !form.emailUser) {
            alert("Display Name and Email Address are required.");
            return;
        }
        const newList: DistributionList = {
            id: listToEdit?.id || uuidv4(),
            displayName: form.displayName,
            primaryEmail: `${form.emailUser}@${form.emailDomain}`,
            creationDate: listToEdit?.creationDate || new Date().toISOString(),
            managerEmail: form.managerEmail,
            memberCount: listToEdit?.memberCount || 0,
        };
        onSave(newList);
    };

    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black/60 z-[59]" onClick={onClose} aria-hidden="true" />}
            <div className={`fixed top-0 right-0 h-full w-full max-w-lg bg-[#f8f8f8] dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 z-[60] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold">{listToEdit ? 'Edit' : 'Add'} Distribution List</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"><Icon name="fas fa-times" /></button>
                </div>
                <div className="flex-grow p-6 space-y-4">
                    <FormField id="displayName" name="displayName" label="Display Name" value={form.displayName} onChange={(e) => setForm({...form, displayName: e.target.value})} required />
                     <div className="mb-4">
                        <label htmlFor="emailUser" className="block text-sm font-medium mb-1">Primary Email Address <span className="text-red-500">*</span></label>
                        <div className="flex items-center">
                            <input id="emailUser" name="emailUser" type="text" value={form.emailUser} onChange={(e) => setForm({...form, emailUser: e.target.value})} className={`w-full px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#679a41] border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700`} />
                            <span className="inline-flex items-center px-3 border-t border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-500 text-sm">@</span>
                            <select name="emailDomain" value={form.emailDomain} onChange={(e) => setForm({...form, emailDomain: e.target.value})} className="px-3 py-2 border rounded-r-md focus:outline-none focus:ring-2 focus:ring-[#679a41] border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
                                {mockMailboxDomains.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>
                    <FormField id="managerEmail" name="managerEmail" label="Manager Email" type="email" value={form.managerEmail} onChange={(e) => setForm({...form, managerEmail: e.target.value})} placeholder="manager@example.com" />
                </div>
                <div className="flex-shrink-0 p-4 border-t bg-white dark:bg-slate-800 dark:border-slate-700 flex justify-end gap-2">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Save</Button>
                </div>
            </div>
        </>
    );
};

export const DistributionListsPage: React.FC = () => {
    const [distributionLists, setDistributionLists] = useState<DistributionList[]>(mockDistributionLists);
    const [filters, setFilters] = useState<DlFilters>(initialDlFilters);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
    const [editingList, setEditingList] = useState<DistributionList | null>(null);

    // State for selections and bulk actions
    const [selectedLists, setSelectedLists] = useState<string[]>([]);
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);


    const filteredLists = useMemo(() => {
        return distributionLists.filter(list => {
            const domain = list.primaryEmail.split('@')[1];
            if (filters.displayName && !list.displayName.toLowerCase().includes(filters.displayName.toLowerCase())) return false;
            if (filters.domain !== 'ALL' && domain !== filters.domain) return false;
            const creationDate = new Date(list.creationDate);
            if (filters.dateFrom && creationDate < new Date(filters.dateFrom)) return false;
            if (filters.dateTo) {
                const toDate = new Date(filters.dateTo);
                toDate.setHours(23, 59, 59, 999);
                if (creationDate > toDate) return false;
            }
            return true;
        }).sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
    }, [distributionLists, filters]);

    const paginatedLists = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        return filteredLists.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredLists, currentPage, rowsPerPage]);

    useEffect(() => { setCurrentPage(1); }, [filters, rowsPerPage]);

    const handleOpenAddPanel = () => {
        setEditingList(null);
        setIsAddPanelOpen(true);
    };

    const handleOpenEditPanel = (list: DistributionList) => {
        setEditingList(list);
        setIsAddPanelOpen(true);
    };

    const handleSaveList = (list: DistributionList) => {
        if (editingList) {
            setDistributionLists(prev => prev.map(l => l.id === list.id ? list : l));
        } else {
            setDistributionLists(prev => [list, ...prev]);
        }
        setIsAddPanelOpen(false);
    };

    // --- Bulk Action Logic ---
    const handleSelectOne = (listId: string, checked: boolean) => {
        setSelectedLists(prev => checked ? [...prev, listId] : prev.filter(id => id !== listId));
    };

    const handleSelectAll = (checked: boolean) => {
        const pageIds = paginatedLists.map(l => l.id);
        if (checked) {
            setSelectedLists(prev => [...new Set([...prev, ...pageIds])]);
        } else {
            setSelectedLists(prev => prev.filter(id => !pageIds.includes(id)));
        }
    };

    const areAllOnPageSelected = useMemo(() => {
        if (paginatedLists.length === 0) return false;
        return paginatedLists.every(l => selectedLists.includes(l.id));
    }, [paginatedLists, selectedLists]);
    
    const handleConfirmBulkDelete = () => {
        setDistributionLists(prev => prev.filter(l => !selectedLists.includes(l.id)));
        setSelectedLists([]);
        setIsBulkDeleteModalOpen(false);
    };
    
    const DefaultToolbar = () => (
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsFilterPanelOpen(true)} leftIconName="fas fa-filter">Filters & Search</Button>
            <Button leftIconName="fas fa-plus-circle" onClick={handleOpenAddPanel}>Add Distribution List</Button>
        </div>
    );
    
    const BulkActionsToolbar = () => (
        <div className="w-full flex justify-between items-center bg-blue-50 dark:bg-sky-900/30 p-2 rounded-lg">
            <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-blue-800 dark:text-sky-300">{selectedLists.length} selected</span>
                <div className="h-6 w-px bg-blue-200 dark:bg-sky-700"></div>
                <Button size="sm" variant="ghost" onClick={() => setIsBulkDeleteModalOpen(true)} leftIconName="fas fa-trash-alt" className="text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50">Delete</Button>
            </div>
            <Button size="icon" variant="ghost" onClick={() => setSelectedLists([])} title="Clear selection"><Icon name="fas fa-times" className="text-gray-500" /></Button>
        </div>
    );
    
    return (
        <>
            <Card title="Distribution Lists" titleActions={selectedLists.length > 0 ? <BulkActionsToolbar /> : <DefaultToolbar />}>
                <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-4 py-3 text-left w-4">
                                    <input type="checkbox" onChange={(e) => handleSelectAll(e.target.checked)} checked={areAllOnPageSelected} className="rounded" />
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Display Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Primary Email Address</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Manager Email</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Creation Date</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {paginatedLists.map(list => (
                                <tr key={list.id} className={selectedLists.includes(list.id) ? 'bg-blue-50/50 dark:bg-sky-900/20' : ''}>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <input type="checkbox" onChange={(e) => handleSelectOne(list.id, e.target.checked)} checked={selectedLists.includes(list.id)} className="rounded" />
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">{list.displayName}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">{list.primaryEmail}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">{list.managerEmail || 'N/A'}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">{new Date(list.creationDate).toLocaleDateString()}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                                        <div className="flex justify-end items-center">
                                            <Button size="icon" variant="ghost" onClick={() => handleOpenEditPanel(list)} title="Edit"><Icon name="fas fa-pencil-alt" /></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <Pagination currentPage={currentPage} totalItems={filteredLists.length} itemsPerPage={rowsPerPage} onPageChange={setCurrentPage} onItemsPerPageChange={setRowsPerPage} />
                </div>
            </Card>

            <Modal isOpen={isBulkDeleteModalOpen} onClose={() => setIsBulkDeleteModalOpen(false)} title="Delete Distribution Lists" footer={<><Button variant="danger" onClick={handleConfirmBulkDelete}>Delete</Button><Button variant="ghost" onClick={() => setIsBulkDeleteModalOpen(false)}>Cancel</Button></>}>
                <p>Are you sure you want to delete {selectedLists.length} selected list(s)? This action cannot be undone.</p>
            </Modal>
            
            <DlFilterPanel isOpen={isFilterPanelOpen} onClose={() => setIsFilterPanelOpen(false)} onApply={setFilters} onClear={() => setFilters(initialDlFilters)} currentFilters={filters} />
            <AddDlPanel isOpen={isAddPanelOpen} onClose={() => setIsAddPanelOpen(false)} onSave={handleSaveList} listToEdit={editingList} />
        </>
    );
};
