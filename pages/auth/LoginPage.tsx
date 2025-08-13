import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthLayout, FormField, Button } from '@/components/ui';
import { useAuth } from '@/context';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const location = useLocation();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Account name and password are required.');
      return;
    }
    try {
      const sessionRedirect = sessionStorage.getItem('loginRedirectPath');
      const from = location.state?.from?.pathname || sessionRedirect;
      if (sessionRedirect) {
        sessionStorage.removeItem('loginRedirectPath');
      }
      await login(email, password, from);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  const handleRoleLogin = async (roleEmail: string, rolePass: string) => {
    setError('');
    try {
      const sessionRedirect = sessionStorage.getItem('loginRedirectPath');
      const from = location.state?.from?.pathname || sessionRedirect;
      if (sessionRedirect) {
        sessionStorage.removeItem('loginRedirectPath');
      }
      await login(roleEmail, rolePass, from);
    } catch (err: any) {
      setError(err.message || `Demo login for ${roleEmail} failed.`);
    }
  };

  return (
    <AuthLayout 
        formTitle="Welcome Back" 
        formSubtitle="Sign in to your WorldPosta account." 
        isLoginPage={true}
    >
      <form onSubmit={handleLoginSubmit} className="space-y-4">
        <FormField 
            id="email" 
            label="Account Name" 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="Enter your account name" 
            required 
        />
        <FormField 
            id="password" 
            label="Password" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="Enter your password" 
            required 
            showPasswordToggle={true}
        />
        
        <div className="flex items-center justify-between text-sm">
            <FormField
                type="checkbox"
                id="rememberMe"
                label="Remember me"
                checked={rememberMe}
                onChange={(e) => setRememberMe((e.target as HTMLInputElement).checked)}
                wrapperClassName="mb-0" 
            />
            <a href="#" className="font-medium text-[#679a41] hover:text-[#588836] dark:text-emerald-400 dark:hover:text-emerald-500 hover:underline">
              Forgot password?
            </a>
        </div>

        {error && <p className="text-sm text-center text-red-600 dark:text-red-400">{error}</p>}
        
        <Button type="submit" fullWidth isLoading={isLoading} size="lg" className="!mt-6">
          Sign In
        </Button>
      </form>
      <div className="mt-4 space-y-2">
        <Button onClick={() => handleRoleLogin('customer@worldposta.com', 'password')} variant="outline" size="md" fullWidth isLoading={isLoading}>
          Login as Customer (Demo)
        </Button>
        <Button onClick={() => handleRoleLogin('admin@worldposta.com', 'password_admin')} variant="outline" size="md" fullWidth isLoading={isLoading}>
          Login as Admin (Demo)
        </Button>
        <Button onClick={() => handleRoleLogin('reseller@worldposta.com', 'password_reseller')} variant="outline" size="md" fullWidth isLoading={isLoading}>
          Login as Reseller (Demo)
        </Button>
      </div>
    </AuthLayout>
  );
};