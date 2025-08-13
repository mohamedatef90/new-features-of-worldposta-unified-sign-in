import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Pagination } from '@/components/ui';
import type { Invoice } from '@/types';
import { mockInvoices } from '@/data';

export const InvoiceHistoryPage: React.FC = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const paginatedInvoices = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        return mockInvoices.slice(startIndex, startIndex + rowsPerPage);
    }, [currentPage, rowsPerPage]);

    const getInvoiceStatusChipClass = (status: 'Paid' | 'Unpaid') => {
        switch (status) {
            case 'Paid':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'Unpaid':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <Card title="Invoice History">
            <div className="overflow-x-auto border dark:border-gray-700 rounded-lg">
                <table className="min-w-full bg-white dark:bg-slate-800">
                    <thead className="bg-gray-50 dark:bg-slate-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Invoice ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedInvoices.map(invoice => (
                            <tr key={invoice.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#293c51] dark:text-white">{invoice.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(invoice.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${invoice.amount.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getInvoiceStatusChipClass(invoice.status)}`}>{invoice.status}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <div className="flex justify-end items-center space-x-2">
                                        <Button size="sm" variant="outline" onClick={() => window.open(invoice.url, '_blank')}>Download PDF</Button>
                                        <Button size="sm" onClick={() => navigate(`/app/invoices/${invoice.id}`)}>View Invoice</Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 <Pagination
                    currentPage={currentPage}
                    totalItems={mockInvoices.length}
                    itemsPerPage={rowsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={(value) => {
                        setRowsPerPage(value);
                        setCurrentPage(1);
                    }}
                />
            </div>
        </Card>
    );
};