


import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button, Card, FormField, Icon, Logo, ToggleSwitch } from '@/components/ui';
import { useAuth } from '@/context';
import { PLANS, FEATURE_CATEGORIES, FAQS } from './constants';
import { PricingCard } from '@/components/ui/PricingCard';
import { FeatureComparison } from '@/components/ui/FeatureComparison';
import { FaqSection } from '@/components/ui/FaqSection';

// Copied from LandingPage, can be extracted to a shared component later if needed
const LandingFooter: React.FC = () => {
    return (
        <footer className="bg-slate-800 dark:bg-slate-900 text-gray-300 py-12">
            <div className="container mx-auto px-4 text-center">
                <Logo iconClassName="h-10 w-auto filter brightness-0 invert mx-auto mb-4" />
                <p>&copy; {new Date().getFullYear()} WorldPosta. All Rights Reserved.</p>
                <div className="mt-4 space-x-6">
                    <Link to="/login" className="hover:text-emerald-400 hover:underline">Portal Login</Link>
                    <a href="https://www.worldposta.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 hover:underline">Privacy Policy</a>
                    <a href="https://www.worldposta.com/terms-of-service" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 hover:underline">Terms of Service</a>
                </div>
            </div>
        </footer>
    );
};

export const PostaPricingPage: React.FC = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('annually');
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const userMenuButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          userMenuRef.current && !userMenuRef.current.contains(event.target as Node) &&
          userMenuButtonRef.current && !userMenuButtonRef.current.contains(event.target as Node)
        ) {
          setUserMenuOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const getDashboardPath = () => {
        if (!user) return '/app/dashboard';
        switch (user.role) {
            case 'admin': return '/app/admin-dashboard';
            case 'reseller': return '/app/reseller-dashboard';
            default: return '/app/dashboard';
        }
    };

    const handleChoosePlan = (planId: string) => {
      if (isAuthenticated) {
        navigate(`/app/billing/email-subscriptions?plan=${planId}&cycle=${billingCycle}`);
      } else {
        navigate('/signup', { state: { from: location } });
      }
    }

    return (
      <div className="bg-gray-50 dark:bg-slate-900">
        <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-50">
          <nav className="container mx-auto flex justify-between items-center p-4">
            <Link to="/">
              <Logo iconClassName="h-8 w-auto" />
            </Link>
            <div className="flex items-center space-x-2 md:space-x-4">
              {isAuthenticated && user ? (
                <div className="relative">
                    <button
                        ref={userMenuButtonRef}
                        onClick={() => setUserMenuOpen(o => !o)}
                        className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-[#679a41] dark:focus:ring-emerald-400"
                        aria-haspopup="true"
                        aria-expanded={userMenuOpen}
                    >
                        {user.avatarUrl ? (
                            <img className="h-8 w-8 rounded-full" src={user.avatarUrl} alt="User avatar" />
                        ) : (
                            <Icon name="fas fa-user-circle" className="h-8 w-8 text-gray-500 dark:text-gray-400 text-3xl" />
                        )}
                        <span className="ml-2 hidden md:inline text-[#293c51] dark:text-gray-200">{user.displayName || user.fullName || 'User'}</span>
                        <Icon name="fas fa-chevron-down" className={`ml-1 text-gray-500 dark:text-gray-400 transform transition-transform duration-200 text-xs ${userMenuOpen ? 'rotate-180' : 'rotate-0'}`} />
                    </button>
                    {userMenuOpen && (
                        <div ref={userMenuRef} className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-slate-700 ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 focus:outline-none text-[#293c51] dark:text-gray-200">
                            <Link to={getDashboardPath()} onClick={() => setUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-600">
                                <Icon name="fas fa-tachometer-alt" className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" fixedWidth /> My Dashboard
                            </Link>
                            <button
                                onClick={() => { logout(); setUserMenuOpen(false); }}
                                className="w-full text-left flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-600 text-red-600 dark:text-red-400"
                            >
                                <Icon name="fas fa-sign-out-alt" className="w-5 h-5 mr-2" fixedWidth /> Sign Out
                            </button>
                        </div>
                    )}
                </div>
              ) : (
                <div className="space-x-2">
                  <Button variant="ghost" onClick={() => navigate('/login', { state: { from: location } })}>Sign In</Button>
                  <Button variant="primary" onClick={() => navigate('/signup', { state: { from: location } })}>Get Started</Button>
                </div>
              )}
            </div>
          </nav>
        </header>
        
        <main>
          {/* Hero Section */}
          <section className="pt-20 text-center bg-gray-50 dark:bg-slate-800">
            <div className="container mx-auto px-4">
              <h1 className="text-4xl md:text-5xl font-bold text-[#293c51] dark:text-gray-100">Find the right plan for your business</h1>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Get started with the essentials or unlock advanced features with a plan that fits your needs.</p>
              <div className="mt-8 flex justify-center items-center space-x-4">
                <span className={`font-medium ${billingCycle === 'monthly' ? 'text-[#293c51] dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>Monthly</span>
                <ToggleSwitch 
                  id="billing-cycle-toggle"
                  checked={billingCycle === 'annually'}
                  onChange={(checked) => setBillingCycle(checked ? 'annually' : 'monthly')}
                />
                <span className={`font-medium ${billingCycle === 'annually' ? 'text-[#293c51] dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                  Annually
                  <span className="ml-2 px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 dark:text-green-200 dark:bg-green-700 rounded-full">Save up to 17%</span>
                </span>
              </div>
            </div>
          </section>

          {/* Pricing Cards Section */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
                {PLANS.map(plan => (
                  <PricingCard key={plan.id} plan={plan} billingCycle={billingCycle} onChoosePlan={handleChoosePlan} />
                ))}
              </div>
            </div>
          </section>

          {/* Feature Comparison Section */}
          <section className="py-20 bg-white dark:bg-slate-800">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                 <h2 className="text-3xl md:text-4xl font-bold text-[#293c51] dark:text-gray-100">Compare All Features</h2>
                 <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Find the right set of features to power your communication.</p>
              </div>
              <FeatureComparison plans={PLANS} featureCategories={FEATURE_CATEGORIES} />
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-20">
             <div className="container mx-auto px-4 max-w-4xl">
              <div className="text-center mb-12">
                 <h2 className="text-3xl md:text-4xl font-bold text-[#293c51] dark:text-gray-100">Frequently Asked Questions</h2>
              </div>
              <FaqSection faqs={FAQS} />
            </div>
          </section>
        </main>

        <LandingFooter />
      </div>
    );
};