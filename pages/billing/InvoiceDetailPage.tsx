
import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Button, Icon, Logo } from '@/components/ui';
import type { Invoice } from '@/types';
import { mockInvoices } from '@/data';

export const InvoiceDetailPage: React.FC = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const invoice = useMemo(() => mockInvoices.find(inv => inv.id === invoiceId), [invoiceId]);

  const handlePrint = () => {
    window.print();
  };
  
  const handleDownloadPdf = () => {
    alert("This would trigger a PDF download of the invoice.");
  };

  if (!invoice) {
    return (
        <Card title="Invoice Not Found">
            <div className="text-center py-10">
                <Icon name="fas fa-file-invoice-dollar" className="text-4xl text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">The invoice with ID "{invoiceId}" could not be found.</p>
                <Button onClick={() => navigate('/app/invoices')} className="mt-6">
                    Back to Invoice History
                </Button>
            </div>
        </Card>
    );
  }

  const getStatusChip = (status: 'Paid' | 'Unpaid') => {
      const baseClasses = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
        switch (status) {
            case 'Paid':
                return <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`}>PAID</span>;
            case 'Unpaid':
                return <span className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`}>UNPAID</span>;
            default:
                return null;
        }
    };

  return (
    <div>
        <div className="flex justify-between items-center mb-4 print:hidden">
            <Button variant="outline" onClick={() => navigate('/app/invoices')} leftIconName="fas fa-arrow-left">Back to History</Button>
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handlePrint} leftIconName="fas fa-print">Print</Button>
                <Button variant="outline" onClick={handleDownloadPdf} leftIconName="fas fa-download">Download PDF</Button>
            </div>
        </div>
        <div className="printable-area">
            <Card className="p-6 sm:p-10 mx-auto max-w-5xl font-sans text-[#293c51] dark:text-gray-200">
                <header className="flex justify-between items-start pb-6 border-b dark:border-gray-700">
                    <div>
                        <Logo iconClassName="h-10 w-auto" />
                        <div className="mt-4 text-xs text-gray-600 dark:text-gray-400">
                            <p className="font-bold">WorldPosta, Inc.</p>
                            <p>789 Cloud Way, Suite 100</p>
                            <p>Internet City, 101010</p>
                            <p>Digital Ocean</p>
                            <p>Tax Reg #: WP123456789</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-3xl font-bold uppercase text-[#293c51] dark:text-gray-100">Invoice</h2>
                        <div className="mt-2 text-sm space-y-1">
                            <p><span className="font-semibold">Invoice #</span> {invoice.id}</p>
                            <p><span className="font-semibold">Invoice Date</span> {new Date(invoice.date).toLocaleDateString()}</p>
                            <p><span className="font-semibold">Invoice Amount</span> ${invoice.amount.toFixed(2)} (USD)</p>
                            <p><span className="font-semibold">Customer ID</span> {invoice.customerId}</p>
                            <div className="pt-2">{getStatusChip(invoice.status)}</div>
                        </div>
                    </div>
                </header>
                
                <section className="grid grid-cols-2 gap-8 py-6">
                    <div>
                        <h3 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">Billed To</h3>
                        <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                            <p className="font-bold">{invoice.customerName}</p>
                            {invoice.customerAddress.map((line, i) => <p key={i}>{line}</p>)}
                            <p>{invoice.customerEmail}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h3 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">Subscription</h3>
                        <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                            <p><span className="font-semibold">ID</span> {invoice.subscriptionId}</p>
                            <p><span className="font-semibold">Billing Period</span> {invoice.billingPeriod}</p>
                            <p><span className="font-semibold">Next Billing Date</span> {invoice.nextBillingDate}</p>
                        </div>
                    </div>
                </section>

                <section className="py-4">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="border-b-2 border-gray-300 dark:border-gray-600">
                                <tr>
                                    <th className="py-2 text-left text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">Description</th>
                                    <th className="py-2 text-right text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">Units</th>
                                    <th className="py-2 text-right text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">Amount (USD)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.lineItems.map((item, i) => (
                                    <tr key={i} className="border-b dark:border-gray-700">
                                        <td className="py-3 pr-4 text-sm font-medium">{item.description}</td>
                                        <td className="py-3 px-4 text-right text-sm">{item.units}</td>
                                        <td className="py-3 pl-4 text-right text-sm font-medium">${item.amount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="flex justify-end py-4">
                    <div className="w-full max-w-xs space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Sub Total</span>
                            <span className="font-medium">${invoice.subTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">{invoice.tax.label}</span>
                            <span className="font-medium">${invoice.tax.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-base border-t pt-2 dark:border-gray-600">
                            <span className="text-[#293c51] dark:text-gray-100">Total</span>
                            <span>${(invoice.subTotal + invoice.tax.amount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Payments</span>
                            <span className="font-medium">${invoice.payments.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg text-[#679a41] dark:text-emerald-400 bg-gray-50 dark:bg-slate-700 p-2 rounded-md">
                            <span>Amount Due (USD)</span>
                            <span>${invoice.amountDue.toFixed(2)}</span>
                        </div>
                    </div>
                </section>

                <section className="pt-6 border-t dark:border-gray-700 text-sm">
                    <div className="mb-4">
                        <h3 className="font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">Payments</h3>
                        <p className="text-gray-600 dark:text-gray-400">{invoice.paymentDetails}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">Notes</h3>
                        <p className="text-gray-600 dark:text-gray-400">All payments are due within 15 days of the invoice date.</p>
                    </div>
                </section>

                <footer className="text-center pt-8 mt-8 border-t dark:border-gray-700">
                    <h3 className="text-lg font-semibold">Thank you for trusting us</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        WorldPosta is a registered trademark of WorldPosta, Inc. All rights reserved. <br/>
                        For any billing inquiries, please contact our support team at support@worldposta.com.
                    </p>
                </footer>
            </Card>
        </div>
        <style>{`
            @media print {
                body * {
                    visibility: hidden;
                }
                .printable-area, .printable-area * {
                    visibility: visible;
                }
                .printable-area {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    margin: 0;
                    padding: 0;
                    border: none;
                    box-shadow: none;
                    background-color: white !important;
                }
                .printable-area .dark\\:text-gray-200, 
                .printable-area .dark\\:text-gray-100,
                .printable-area .dark\\:text-gray-300,
                .printable-area .dark\\:text-emerald-400,
                .printable-area .dark\\:text-white {
                    color: #293c51 !important;
                }
                .printable-area .dark\\:bg-slate-800,
                .printable-area .dark\\:bg-slate-700 {
                    background-color: white !important;
                }
                .printable-area .dark\\:border-gray-700,
                .printable-area .dark\\:border-gray-600 {
                    border-color: #e5e7eb !important;
                }
            }
        `}</style>
    </div>
  );
};
