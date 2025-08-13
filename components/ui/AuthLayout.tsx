import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { Card } from './Card';
import { Footer } from './Footer';

interface AuthLayoutProps {
  formTitle: string;
  formSubtitle: string;
  children: React.ReactNode; 
  isLoginPage: boolean;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, formTitle, formSubtitle, isLoginPage }) => {
  return (
    <div
      className="min-h-screen flex flex-col bg-cover bg-center text-[#293c51] dark:text-gray-200"
      style={{ backgroundImage: "url('https://logincdn.msftauth.net/shared/5/images/fluent_web_light_57fee22710b04cebe1d5.svg')" }}
    >
      <main className="flex-grow w-full flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 bg-gray-50/70 dark:bg-slate-900/70 backdrop-blur-sm">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <Logo className="mx-auto justify-center" iconClassName="h-10 w-auto dark:filter dark:brightness-0 dark:invert" />
            <h2 className="mt-6 text-3xl font-bold text-[#293c51] dark:text-gray-100">
              {formTitle}
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {formSubtitle}
            </p>
          </div>

          <Card className="p-6 sm:p-8 shadow-lg">
            {children}
          </Card>
          
          <div className="text-center text-sm">
            {isLoginPage ? (
              <p className="text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link to="/signup" className="font-medium text-[#679a41] hover:text-[#588836] dark:text-emerald-400 dark:hover:text-emerald-500 hover:underline">
                  Sign up
                </Link>
              </p>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-[#679a41] hover:text-[#588836] dark:text-emerald-400 dark:hover:text-emerald-500 hover:underline">
                  Sign in
                </Link>
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
