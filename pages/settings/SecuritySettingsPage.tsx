
import React, { useState } from 'react';
import { useAuth } from '@/context';
import { Card, Button, Modal, FormField, Icon, ToggleSwitch } from '@/components/ui';

export const SecuritySettingsPage: React.FC = () => {
    const { user } = useAuth();
    const [isMfaModalOpen, setIsMfaModalOpen] = useState(false);
    const [mfaEnabled, setMfaEnabled] = useState(false);
    const [mfaStep, setMfaStep] = useState(1);
    const [mfaMethod, setMfaMethod] = useState<'app' | 'email'>('app');
    const [mfaVerificationCode, setMfaVerificationCode] = useState('');
    const [mfaError, setMfaError] = useState('');

    const handleCloseMfaModal = () => {
        setIsMfaModalOpen(false);
        setTimeout(() => {
            setMfaStep(1);
            setMfaMethod('app');
            setMfaVerificationCode('');
            setMfaError('');
        }, 300);
    };

    const handleMfaSubmit = () => {
        setMfaError('');
        if (mfaStep === 1) {
            setMfaStep(2);
        } else if (mfaStep === 2) {
            if (mfaVerificationCode === '123456') { // Mock verification
                setMfaEnabled(true);
                setMfaStep(3);
            } else {
                setMfaError('Invalid verification code. Please try again.');
            }
        }
    };
    
    const handleDisableMfa = () => {
        if (window.confirm("Are you sure you want to disable Multi-Factor Authentication?")) {
            setMfaEnabled(false);
            handleCloseMfaModal();
        }
    };


    const mockLoginLogs = [
        { id: 1, date: new Date().toISOString(), ip: '192.168.1.10', location: 'New York, USA', device: 'Chrome on macOS', status: 'Success' },
        { id: 2, date: new Date(Date.now() - 3600000 * 5).toISOString(), ip: '10.0.0.5', location: 'London, UK', device: 'Firefox on Windows', status: 'Success' },
        { id: 3, date: new Date(Date.now() - 3600000 * 25).toISOString(), ip: '203.0.113.19', location: 'Tokyo, Japan', device: 'Safari on iOS', status: 'Failed' },
        { id: 4, date: new Date(Date.now() - 3600000 * 48).toISOString(), ip: '198.51.100.22', location: 'Sydney, Australia', device: 'Chrome on Android', status: 'Success' },
    ];
    
    return (
        <div className="space-y-6">
            <Card title="Multi-Factor Authentication (MFA)">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-gray-600 dark:text-gray-400">Add an extra layer of security to protect your account from unauthorized access.</p>
                        <div className="mt-2 flex items-center gap-2">
                           {mfaEnabled ? (
                                <>
                                    <Icon name="fas fa-check-circle" className="text-green-500" />
                                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">MFA is enabled.</span>
                                </>
                            ) : (
                                <>
                                   <Icon name="fas fa-times-circle" className="text-red-500" />
                                   <span className="text-sm font-semibold text-red-600 dark:text-red-400">MFA is currently disabled.</span>
                                </>
                           )}
                        </div>
                    </div>
                    <Button onClick={() => setIsMfaModalOpen(true)} leftIconName="fas fa-shield-alt">
                        {mfaEnabled ? 'Manage MFA' : 'Enable MFA'}
                    </Button>
                </div>
            </Card>

            <Card title="Recent Login Activity">
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white dark:bg-slate-800">
                        <thead className="bg-gray-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">IP Address</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Location</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Device/Browser</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {mockLoginLogs.map(log => (
                                <tr key={log.id}>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(log.date).toLocaleString()}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400">{log.ip}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.location}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.device}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.status === 'Success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                                            {log.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={isMfaModalOpen} onClose={handleCloseMfaModal} title={mfaEnabled ? "Manage MFA" : "Setup Multi-Factor Authentication"} size="lg">
                {mfaEnabled ? (
                     <div className="text-center space-y-6 py-8">
                        <Icon name="fas fa-shield-alt" className="text-5xl text-green-500 mx-auto" />
                        <p className="text-gray-700 dark:text-gray-200">Multi-Factor Authentication is currently active on your account.</p>
                        <div className="flex justify-center gap-4">
                            <Button variant="outline" onClick={handleCloseMfaModal}>Close</Button>
                            <Button variant="danger" onClick={handleDisableMfa}>Disable MFA</Button>
                        </div>
                    </div>
                ) : (
                    <>
                    {mfaStep === 1 && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                Choose your preferred method to receive security codes when you sign in.
                            </p>
                            <label htmlFor="mfa-app" className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${mfaMethod === 'app' ? 'border-[#679a41] ring-2 ring-[#679a41]/50 bg-green-50 dark:bg-emerald-900/30' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}>
                                <div className="flex items-center">
                                    <input type="radio" id="mfa-app" name="mfa-method" value="app" checked={mfaMethod === 'app'} onChange={() => setMfaMethod('app')} className="h-4 w-4 text-[#679a41] focus:ring-[#679a41] border-gray-300" />
                                    <div className="ml-4 flex items-center gap-3">
                                        <Icon name="fas fa-qrcode" className="text-3xl text-[#679a41] dark:text-emerald-400 w-8 text-center" />
                                        <div>
                                            <h4 className="font-semibold text-[#293c51] dark:text-gray-100">Authenticator App</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Use an app like Google Authenticator, Authy, or 1Password.</p>
                                        </div>
                                    </div>
                                </div>
                            </label>
                            <label htmlFor="mfa-email" className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${mfaMethod === 'email' ? 'border-[#679a41] ring-2 ring-[#679a41]/50 bg-green-50 dark:bg-emerald-900/30' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}>
                                <div className="flex items-center">
                                    <input type="radio" id="mfa-email" name="mfa-method" value="email" checked={mfaMethod === 'email'} onChange={() => setMfaMethod('email')} className="h-4 w-4 text-[#679a41] focus:ring-[#679a41] border-gray-300" />
                                    <div className="ml-4 flex items-center gap-3">
                                        <Icon name="fas fa-envelope-open-text" className="text-3xl text-[#679a41] dark:text-emerald-400 w-8 text-center" />
                                        <div>
                                            <h4 className="font-semibold text-[#293c51] dark:text-gray-100">Email Authentication</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Receive a code to your registered email address upon login.</p>
                                        </div>
                                    </div>
                                </div>
                            </label>
                            <div className="mt-6 flex justify-end space-x-2">
                                <Button variant="outline" onClick={handleCloseMfaModal}>Cancel</Button>
                                <Button onClick={handleMfaSubmit} disabled={!mfaMethod}>Continue</Button>
                            </div>
                        </div>
                    )}

                    {mfaStep === 2 && mfaMethod === 'app' && (
                        <div className="space-y-4 text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Scan the image below with your authenticator app, then enter the 6-digit code to verify.</p>
                            <div className="flex justify-center p-4 bg-white rounded-lg">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/WorldPosta:${user?.email}?secret=JBSWY3DPEHPK3PXP&issuer=WorldPosta`} alt="QR Code for MFA Setup" />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Can't scan? Enter this code manually:</p>
                            <p className="font-mono tracking-widest p-2 bg-gray-100 dark:bg-slate-700 rounded-md">JBSWY3DPEHPK3PXP</p>
                            <FormField id="mfa-code" label="Verification Code" value={mfaVerificationCode} onChange={e => setMfaVerificationCode(e.target.value)} placeholder="Enter 6-digit code" error={mfaError} inputClassName="text-center tracking-[0.5em]" maxLength={6}/>
                            <div className="mt-6 flex justify-between">
                                <Button variant="outline" onClick={() => setMfaStep(1)}>Back</Button>
                                <Button onClick={handleMfaSubmit}>Verify & Enable</Button>
                            </div>
                        </div>
                    )}
                    
                    {mfaStep === 2 && mfaMethod === 'email' && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">We've sent a 6-digit verification code to <span className="font-semibold text-[#293c51] dark:text-gray-200">{user?.email}</span>. Please enter it below.</p>
                            <FormField id="mfa-code" label="Verification Code" value={mfaVerificationCode} onChange={e => setMfaVerificationCode(e.target.value)} placeholder="Enter 6-digit code" error={mfaError} inputClassName="text-center tracking-[0.5em]" maxLength={6}/>
                            <div className="mt-6 flex justify-between">
                                <Button variant="outline" onClick={() => setMfaStep(1)}>Back</Button>
                                <Button onClick={handleMfaSubmit}>Verify & Enable</Button>
                            </div>
                        </div>
                    )}

                    {mfaStep === 3 && (
                        <div className="text-center space-y-4 py-8">
                            <Icon name="fas fa-check-circle" className="text-5xl text-green-500 mx-auto" />
                            <h3 className="text-xl font-semibold text-[#293c51] dark:text-gray-100">MFA Enabled!</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">You have successfully secured your account with Multi-Factor Authentication.</p>
                            <div className="mt-6 flex justify-center">
                                <Button onClick={handleCloseMfaModal}>Done</Button>
                            </div>
                        </div>
                    )}
                    </>
                )}
            </Modal>
        </div>
    );
};
