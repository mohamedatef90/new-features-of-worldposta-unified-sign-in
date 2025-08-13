import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthLayout, FormField, Button } from '@/components/ui';
import { useAuth } from '@/context';

export const SignupPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { signup, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.from?.pathname) {
      sessionStorage.setItem('loginRedirectPath', location.state.from.pathname);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName || !email || !companyName || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await signup({ fullName, email, companyName, password });
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <AuthLayout 
        formTitle="Create an account" 
        formSubtitle="Get started with WorldPosta services" 
        isLoginPage={false}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField id="fullName" label="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required 
            placeholder="Enter your full name"/>
        <FormField id="email" label="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} required 
            placeholder="you@example.com"/>
        <FormField id="companyName" label="Company Name" value={companyName} onChange={e => setCompanyName(e.target.value)} required 
            placeholder="Your company's name"/>
        <FormField id="password" label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required showPasswordToggle={true}
            placeholder="Create a strong password"/>
        <FormField id="confirmPassword" label="Confirm Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required showPasswordToggle={true}
            placeholder="Confirm your password"/>
        {error && <p className="text-sm text-center text-red-600 dark:text-red-400">{error}</p>}
        <Button type="submit" fullWidth isLoading={isLoading} size="lg" className="!mt-6">
          Create Account
        </Button>
      </form>
    </AuthLayout>
  );
};