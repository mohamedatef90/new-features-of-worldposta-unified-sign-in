import React, { useState } from 'react';
import { Card, Button, FormField, Icon } from '@/components/ui';

const GeneralSettingsTab: React.FC = () => {
    // Mock state for general settings
    const [settings, setSettings] = useState({
        systemUrl: 'https://console.worldposta.com',
        timeZone: 'UTC-05:00',
        dateFormat: 'MM/DD/YYYY',
        systemLanguage: 'en-us',
    });
    const [logoPreview, setLogoPreview] = useState<string | null>('https://www.worldposta.com/assets/WP-Logo.png');
    const [faviconPreview, setFaviconPreview] = useState<string | null>('https://www.worldposta.com/assets/Newhomeimgs/vds-vs-vms/icons/Asset%201.png');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string | null>>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setter(event.target?.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    return (
        <Card title="General Settings">
            <div className="space-y-6">
                <FormField id="systemUrl" label="System URL" value={settings.systemUrl} onChange={() => {}} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField as="select" id="timeZone" label="Time Zone" value={settings.timeZone} onChange={() => {}}>
                        <option>UTC-05:00</option>
                        <option>UTC+00:00</option>
                        <option>UTC+08:00</option>
                    </FormField>
                    <FormField as="select" id="dateFormat" label="Date Format" value={settings.dateFormat} onChange={() => {}}>
                        <option>MM/DD/YYYY</option>
                        <option>DD/MM/YYYY</option>
                        <option>YYYY-MM-DD</option>
                    </FormField>
                     <FormField as="select" id="systemLanguage" label="System Language" value={settings.systemLanguage} onChange={() => {}}>
                        <option value="en-us">English (US)</option>
                        <option value="en-gb">English (UK)</option>
                    </FormField>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-[#293c51] dark:text-gray-300">Company Logo</label>
                        <div className="flex items-center gap-4">
                            <div className="w-32 h-16 p-2 border rounded-md flex items-center justify-center bg-gray-50 dark:bg-slate-700">
                                {logoPreview ? <img src={logoPreview} alt="Company Logo Preview" className="max-w-full max-h-full object-contain"/> : <span className="text-xs text-gray-400">No Logo</span>}
                            </div>
                            <input type="file" id="logo-upload" className="hidden" onChange={e => handleFileChange(e, setLogoPreview)} />
                            <Button type="button" variant="outline" onClick={() => document.getElementById('logo-upload')?.click()}>Upload Logo</Button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-[#293c51] dark:text-gray-300">Favicon</label>
                        <div className="flex items-center gap-4">
                             <div className="w-16 h-16 p-2 border rounded-md flex items-center justify-center bg-gray-50 dark:bg-slate-700">
                                {faviconPreview ? <img src={faviconPreview} alt="Favicon Preview" className="max-w-full max-h-full object-contain"/> : <span className="text-xs text-gray-400">No Icon</span>}
                            </div>
                            <input type="file" id="favicon-upload" className="hidden" onChange={e => handleFileChange(e, setFaviconPreview)} />
                            <Button type="button" variant="outline" onClick={() => document.getElementById('favicon-upload')?.click()}>Upload Favicon</Button>
                        </div>
                    </div>
                </div>
                 <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-700">
                    <Button variant="outline">Reset to Defaults</Button>
                    <Button>Save Changes</Button>
                </div>
            </div>
        </Card>
    );
};

const SmtpConfigTab: React.FC = () => {
    const [smtpConfig, setSmtpConfig] = useState({
        smtpServer: '',
        smtpPort: '587',
        smtpUsername: '',
        smtpPassword: '',
        fromEmail: '',
        fromName: '',
        encryption: 'TLS',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSmtpConfig(prev => ({ ...prev, [name]: value }));
    };

    return (
        <Card title="SMTP Configuration">
            <div className="space-y-6 max-w-2xl mx-auto">
                <FormField id="smtpServer" name="smtpServer" label="SMTP Server" placeholder="smtp.example.com" value={smtpConfig.smtpServer} onChange={handleChange} />
                <FormField id="smtpPort" name="smtpPort" label="SMTP Port" type="number" placeholder="587" value={smtpConfig.smtpPort} onChange={handleChange} />
                <FormField id="smtpUsername" name="smtpUsername" label="SMTP Username" value={smtpConfig.smtpUsername} onChange={handleChange} />
                <FormField id="smtpPassword" name="smtpPassword" label="SMTP Password" type="password" showPasswordToggle value={smtpConfig.smtpPassword} onChange={handleChange} />
                <FormField id="fromEmail" name="fromEmail" label="From Email Address" type="email" value={smtpConfig.fromEmail} onChange={handleChange} />
                <FormField id="fromName" name="fromName" label="From Name" value={smtpConfig.fromName} onChange={handleChange} />
                <FormField as="select" id="encryption" name="encryption" label="Encryption" value={smtpConfig.encryption} onChange={handleChange}>
                    <option>None</option>
                    <option>SSL</option>
                    <option>TLS</option>
                </FormField>
                <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-700">
                    <Button variant="secondary">Test Connection</Button>
                    <Button>Save Changes</Button>
                </div>
            </div>
        </Card>
    );
};

const LicenseTab: React.FC = () => {
    return (
        <Card title="License Information">
            <div className="space-y-6 max-w-2xl mx-auto">
                <FormField as="textarea" rows={6} id="licenseKey" label="License Key" value="ABCD-EFGH-IJKL-MNOP-QRST-UVWX-YZ12-3456" disabled onChange={() => {}} />
                <div className="p-4 bg-green-50 dark:bg-green-900/40 border border-green-200 dark:border-green-700 rounded-lg flex items-center gap-3">
                    <Icon name="fas fa-check-circle" className="text-green-500 text-xl" />
                    <div>
                        <p className="font-semibold text-green-800 dark:text-green-300">Your license is active and valid.</p>
                        <p className="text-sm text-green-700 dark:text-green-400">Expires on: December 31, 2025</p>
                    </div>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-700">
                    <Button variant="outline">Contact Support</Button>
                    <Button>Upgrade License</Button>
                </div>
            </div>
        </Card>
    );
};

export const SystemSettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('general');

    const tabItems = [
        { id: 'general', name: 'General Settings' },
        { id: 'smtp', name: 'SMTP Configuration' },
        { id: 'license', name: 'License' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-[#293c51] dark:text-gray-100">System Settings</h1>

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
                {activeTab === 'general' && <GeneralSettingsTab />}
                {activeTab === 'smtp' && <SmtpConfigTab />}
                {activeTab === 'license' && <LicenseTab />}
            </div>
        </div>
    );
};