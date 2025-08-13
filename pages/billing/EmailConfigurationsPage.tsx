
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, FormField, Stepper, Icon } from '@/components/ui';

export const EmailConfigurationsPage: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [domainName, setDomainName] = useState('');
    const [emailUser, setEmailUser] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [sendInstructions, setSendInstructions] = useState(false);
    const [additionalEmail, setAdditionalEmail] = useState('');
    const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'failed'>('idle');

    const steps = [
        { name: 'Create Mailbox' },
        { name: 'Verify MX & SPF' },
        { name: 'Email Migration' }
    ];

    const generatePassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?';
        let newPassword = '';
        for (let i = 0; i < 22; i++) {
            newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPassword(newPassword);
        setConfirmPassword(newPassword);
    };

    const handleNext = () => {
        if (currentStep === 0) {
            if (!firstName || !lastName || !displayName || !domainName || !emailUser || !password || !confirmPassword) {
                alert("Please fill all required fields.");
                return;
            }
            if (password !== confirmPassword) {
                alert("Passwords do not match.");
                return;
            }
        }
        setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    };

    const handleCancel = () => {
        navigate('/app/billing');
    };

    const handleVerify = () => {
        setVerificationStatus('verifying');
        setTimeout(() => {
            if (domainName) { // Mock success if domain is entered
                setVerificationStatus('success');
            } else {
                setVerificationStatus('failed');
            }
        }, 2000);
    };

    const DNSRecordRow: React.FC<{type: string, name: string, value: string, priority?: number, ttl?: string}> = ({type, name, value, priority, ttl="14400 (4 hours)"}) => {
        const handleCopy = (text: string) => {
            navigator.clipboard.writeText(text).then(() => {
                alert(`Copied: ${text}`);
            }, (err) => {
                alert('Failed to copy text.');
                console.error('Could not copy text: ', err);
            });
        };

        return (
            <tr className="border-b dark:border-gray-700">
                <td className="px-4 py-3 text-sm font-semibold">{type}</td>
                <td className="px-4 py-3 text-sm font-mono">{name}</td>
                <td className="px-4 py-3 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="font-mono">{value}</span>
                        <Button size="icon" variant="ghost" onClick={() => handleCopy(value)} title="Copy value">
                            <Icon name="far fa-copy" />
                        </Button>
                    </div>
                    {priority && <p className="text-xs text-gray-500">Priority: {priority}</p>}
                </td>
                <td className="px-4 py-3 text-sm font-mono">{ttl}</td>
            </tr>
        );
    };

    return (
        <Card title="Email Configurations">
            <div className="w-full md:w-3/4 lg:w-2/3 mx-auto">
                <Stepper steps={steps} currentStep={currentStep} className="my-8" />
            </div>

            {currentStep === 0 && (
                <div className="mt-8 max-w-2xl mx-auto">
                    <h3 className="text-lg font-semibold text-center mb-6">Create Your First Mailbox</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            id="firstName"
                            label="First Name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Enter first name"
                            required
                        />
                        <FormField
                            id="lastName"
                            label="Last Name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Enter last name"
                            required
                        />
                    </div>
                    <FormField
                        id="displayName"
                        label="Display Name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Enter display name"
                        required
                    />
                    
                    <FormField
                        id="domainName"
                        label="Domain Name"
                        value={domainName}
                        onChange={(e) => setDomainName(e.target.value)}
                        placeholder="example.com"
                        required
                    />
                    <div className="mb-4">
                        <label htmlFor="emailUser" className="block text-sm font-medium mb-1 text-[#293c51] dark:text-gray-300">
                            Email Address <span className="text-red-500 dark:text-red-400">*</span>
                        </label>
                        <div className="flex items-center">
                            <input
                                id="emailUser"
                                name="emailUser"
                                type="text"
                                value={emailUser}
                                onChange={(e) => setEmailUser(e.target.value)}
                                placeholder="your-name"
                                className="w-full px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#679a41] dark:focus:ring-emerald-400 focus:border-[#679a41] dark:focus:border-emerald-400 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                required
                            />
                            <span className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm rounded-r-md">
                                @{domainName || 'your-domain.com'}
                            </span>
                        </div>
                    </div>
                    <FormField
                        id="password"
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        showPasswordToggle
                    />
                     <FormField
                        id="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        showPasswordToggle
                    />
                    <div className="text-right -mt-2 mb-4">
                         <Button type="button" variant="ghost" size="sm" onClick={generatePassword}>
                            Generate Complex Password
                        </Button>
                    </div>
                    <FormField
                        type="checkbox"
                        id="sendInstructions"
                        label="Send setup instructions"
                        checked={sendInstructions}
                        onChange={(e) => setSendInstructions((e.target as HTMLInputElement).checked)}
                    />
                    {sendInstructions && (
                         <FormField
                            id="additionalEmail"
                            label="Additional setup instructions email"
                            type="email"
                            value={additionalEmail}
                            onChange={(e) => setAdditionalEmail(e.target.value)}
                            placeholder="another.email@example.com"
                            hint="Instructions will be sent to the new mailbox and this address if provided."
                        />
                    )}

                    <div className="flex justify-end space-x-2 mt-8">
                        <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                        <Button onClick={handleNext}>Next</Button>
                    </div>
                </div>
            )}
            
            {currentStep === 1 && (
                 <div className="mt-8 max-w-4xl mx-auto">
                    <h3 className="text-lg font-semibold text-center mb-2">Verify Your Domain's MX & SPF Records</h3>
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                        To receive emails at <span className="font-semibold text-[#293c51] dark:text-gray-200">{emailUser}@{domainName}</span>, you need to update your domain's DNS records at your domain registrar (e.g., GoDaddy, Namecheap).
                    </p>
                    
                    <Card title="Required DNS Records">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50 dark:bg-slate-700">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name/Host</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Value/Target</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">TTL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <DNSRecordRow type="MX" name="@" value="mail.worldposta.com" priority={10} />
                                    <DNSRecordRow type="TXT" name="@" value={`"v=spf1 include:spf.worldposta.com ~all"`} />
                                </tbody>
                            </table>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                            Note: DNS changes can take up to 48 hours to propagate fully, but are usually much faster.
                        </p>
                    </Card>
                    
                    <div className="text-center mt-6">
                        {verificationStatus === 'idle' && (
                            <Button onClick={handleVerify} leftIconName="fas fa-check-double">Verify DNS Records</Button>
                        )}
                        {verificationStatus === 'verifying' && (
                            <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                                <Icon name="fas fa-circle-notch fa-spin fa-sm" /> Verifying records...
                            </div>
                        )}
                        {verificationStatus === 'success' && (
                            <div className="p-4 bg-green-50 dark:bg-green-900/40 border border-green-200 dark:border-green-700 rounded-lg inline-flex items-center gap-2">
                                <Icon name="fas fa-check-circle" className="text-green-500" />
                                <span className="text-sm font-semibold text-green-700 dark:text-green-300">Domain verified successfully!</span>
                            </div>
                        )}
                        {verificationStatus === 'failed' && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 rounded-lg inline-block">
                                <div className="flex items-center gap-2">
                                    <Icon name="fas fa-times-circle" className="text-red-500" />
                                    <span className="text-sm font-semibold text-red-700 dark:text-red-400">Verification failed. Please double-check your records.</span>
                                </div>
                                <Button onClick={handleVerify} variant="outline" size="sm" className="mt-2">Try Again</Button>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center mt-8">
                        <Button variant="outline" onClick={() => setCurrentStep(0)}>Back</Button>
                        <Button onClick={handleNext} disabled={verificationStatus !== 'success'}>Next</Button>
                    </div>
                </div>
            )}

             {currentStep === 2 && (
                <div className="mt-8 max-w-2xl mx-auto text-center">
                    <Icon name="fas fa-rocket" className="text-5xl text-[#679a41] dark:text-emerald-400 mb-4" />
                    <h3 className="text-2xl font-semibold">Ready to Get Started?</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-4 mb-8">
                        Your mailbox is ready! You can now choose to migrate emails from your previous provider, or you can skip this step and go directly to your new inbox.
                    </p>
                    
                    <div className="space-y-4">
                        <Button size="lg" fullWidth onClick={() => alert('This would open an email migration wizard.')}>
                            <Icon name="fas fa-magic" className="mr-2" />
                            Start Email Migration
                        </Button>
                        <Button 
                            size="lg" 
                            fullWidth 
                            variant="outline" 
                            onClick={() => window.open('https://mail.worldposta.com/owa/', '_blank')}
                        >
                            <Icon name="fas fa-sign-in-alt" className="mr-2" />
                            Skip and Go to My Inbox
                        </Button>
                    </div>

                    <div className="flex justify-between items-center mt-12">
                        <Button variant="ghost" onClick={() => setCurrentStep(1)}>Back</Button>
                        <Button variant="ghost" onClick={handleCancel}>Finish & Return to Subscriptions</Button>
                    </div>
                </div>
            )}
        </Card>
    );
};
