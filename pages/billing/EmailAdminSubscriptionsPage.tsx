

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card, FormField, CollapsibleSection, Stepper, Icon, Spinner } from '@/components/ui'; 
import type { EmailPlan, EmailPlanDuration } from '@/types';
import { PLANS } from '../pricing/constants';

const emailPlans: EmailPlan[] = PLANS.map(p => ({
  id: p.id,
  name: p.name,
  basePriceMonthly: p.priceMonthly,
  features: p.features,
  description: p.description,
  isRecommended: p.isRecommended
}));

const ADVANCED_RULES_PRICE_MONTHLY = 2.00;

// Represents a single configured plan in the order
interface ConfiguredPlan {
  planId: string;
  quantity: number;
  subscriptionTerm: number;
  subscriptionUnit: EmailPlanDuration;
  advancedRulesEnabled: boolean;
}

// Calculate total price for the entire order
const calculateOrderTotal = (configuredPlans: ConfiguredPlan[]): number => {
  return configuredPlans.reduce((total, configuredPlan) => {
    const planDetails = emailPlans.find(p => p.id === configuredPlan.planId);
    if (!planDetails) return total;

    let monthlyPricePerUnit = planDetails.basePriceMonthly;
    if (configuredPlan.advancedRulesEnabled && !['light', 'business'].includes(planDetails.id)) {
      monthlyPricePerUnit += ADVANCED_RULES_PRICE_MONTHLY;
    }

    let planTotal = 0;
    const term = configuredPlan.subscriptionTerm || 1;

    switch (configuredPlan.subscriptionUnit) {
      case 'monthly':
        planTotal = monthlyPricePerUnit * configuredPlan.quantity * term;
        break;
      case 'yearly':
        // Apply 17% discount for yearly, and multiply by term (number of years)
        planTotal = (monthlyPricePerUnit * 12 * configuredPlan.quantity * term) * 0.83; 
        break;
    }
    return total + planTotal;
  }, 0);
};


interface PlanCardProps {
  plan: EmailPlan;
  currentConfig: ConfiguredPlan;
  onPlanChange: (planConfig: ConfiguredPlan) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, currentConfig, onPlanChange }) => {
  const descriptiveFeature = plan.features.find(f => f.startsWith('Everything in'));
  const regularFeatures = plan.features.filter(f => !f.startsWith('Everything in'));

  const handleUpdate = (update: Partial<ConfiguredPlan>) => {
    onPlanChange({ ...currentConfig, ...update });
  };

  const isSelected = currentConfig.quantity > 0;

  return (
    <Card className={`relative flex flex-col h-full border ${isSelected ? 'border-2 border-[#679a41] dark:border-emerald-500' : (plan.isRecommended ? 'border-2 border-gray-300 dark:border-gray-600' : 'border-gray-200 dark:border-gray-700')} hover:shadow-lg transition-shadow`}>
       {isSelected && (
          <div className="absolute top-0 -translate-y-1/2 left-6 px-3 py-1 text-xs font-semibold tracking-wider text-white uppercase bg-[#679a41] dark:bg-emerald-500 rounded-full z-10">
            Selected
          </div>
      )}
      {plan.isRecommended && !isSelected && (
          <div className="absolute top-0 -translate-y-1/2 left-6 px-3 py-1 text-xs font-semibold tracking-wider text-white uppercase bg-gray-500 dark:bg-gray-400 rounded-full z-10">
            Recommended
          </div>
      )}
      <h3 className="text-xl font-semibold text-[#293c51] dark:text-gray-100 mb-1 mt-2">
        {plan.name} - ${plan.basePriceMonthly.toFixed(2)}/mo
      </h3>
      
      {descriptiveFeature && (
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">{descriptiveFeature}</p>
      )}

      <CollapsibleSection 
        items={regularFeatures} 
        maxItemsToShow={3} 
        className="mb-4 text-sm"
        itemClassName="text-sm text-gray-500 dark:text-gray-400"
        seeMoreLinkClassName="text-xs text-[#679a41] dark:text-emerald-400 hover:underline mt-1 cursor-pointer"
      >
         <></>
      </CollapsibleSection>

      <div className="mb-4">
        <FormField
          id={`${plan.id}-quantity`}
          label="Quantity"
          type="number"
          value={currentConfig.quantity}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            handleUpdate({ quantity: isNaN(val) || val < 0 ? 0 : val });
          }}
          min={0}
          inputClassName="w-28 text-sm py-2" 
        />
      </div>
      
      {!['light', 'business'].includes(plan.id) && (
        <FormField
            type="checkbox"
            id={`${plan.id}-advanced-rules`}
            label={`Advanced Rules Engine (+$${ADVANCED_RULES_PRICE_MONTHLY.toFixed(2)}/mo)`}
            checked={currentConfig.advancedRulesEnabled}
            onChange={(e) => handleUpdate({ advancedRulesEnabled: (e.target as HTMLInputElement).checked })}
            labelClassName="text-sm"
        />
      )}
    </Card>
  );
};

interface SubscriptionSummaryCardProps {
  order: ConfiguredPlan[];
  totalAmount: number;
  onProceed: () => void;
  isProceedDisabled: boolean;
  globalSubscriptionTerm: number;
  setGlobalSubscriptionTerm: (value: number) => void;
  globalSubscriptionUnit: EmailPlanDuration;
  setGlobalSubscriptionUnit: (value: EmailPlanDuration) => void;
}

const SubscriptionSummaryCard: React.FC<SubscriptionSummaryCardProps> = ({ 
  order, totalAmount, onProceed, isProceedDisabled, 
  globalSubscriptionTerm, setGlobalSubscriptionTerm, globalSubscriptionUnit, setGlobalSubscriptionUnit 
}) => {
  return (
    <Card title="Your Order" className="sticky top-20">
      <div className="border-b border-gray-300 dark:border-gray-600 pb-4 mb-4">
        <h4 className="text-md font-semibold text-[#293c51] dark:text-gray-200 mb-2">Billing Cycle</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">This will apply to all items in your order.</p>
        <div className="grid grid-cols-2 gap-4">
            <FormField
                id="global-subscription-term"
                label="Term"
                type="number"
                value={globalSubscriptionTerm}
                onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setGlobalSubscriptionTerm(isNaN(val) || val < 1 ? 1 : val);
                }}
                min={1}
            />
            <FormField
                id="global-subscription-unit"
                label="Unit"
                as="select"
                value={globalSubscriptionUnit}
                onChange={(e) => setGlobalSubscriptionUnit(e.target.value as EmailPlanDuration)}
            >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly (17% Off)</option>
            </FormField>
        </div>
      </div>
      
      <h4 className="text-md font-semibold text-[#293c51] dark:text-gray-200 mb-2">Summary</h4>
      <div className="mb-3 min-h-[50px]">
        {order.length === 0 || order.every(item => item.quantity === 0) ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No Posta items selected yet.</p>
        ) : (
          <ul className="space-y-2">
            {order.filter(item => item.quantity > 0).map(item => {
              const planDetails = emailPlans.find(p => p.id === item.planId);
              if (!planDetails) return null;
              return (
                <li key={item.planId} className="text-sm text-gray-700 dark:text-gray-300">
                    <div>{planDetails.name} x {item.quantity}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {item.advancedRulesEnabled && !['light', 'business'].includes(planDetails.id) && "Advanced Rules"}
                    </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      
      <div className="border-t border-[#679a41]/50 dark:border-emerald-500/50 pt-3 mt-3">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-semibold text-[#293c51] dark:text-gray-100">Total:</span>
          <span className="text-xl font-bold text-[#679a41] dark:text-emerald-400">${totalAmount.toFixed(2)}</span>
        </div>
        <Button onClick={onProceed} fullWidth disabled={isProceedDisabled}>
          Subscribe
        </Button>
      </div>
    </Card>
  );
};

const PaymentStep: React.FC<{
    order: ConfiguredPlan[], 
    totalAmount: number, 
    onBack: () => void, 
    onPay: () => void
}> = ({ order, totalAmount, onBack, onPay }) => {
    const [isPaying, setIsPaying] = useState(false);

    const handlePaymentRedirect = () => {
        setIsPaying(true);
        // Open Stripe in a new tab to simulate the redirection
        window.open('https://stripe.com/', '_blank', 'noopener,noreferrer');
        
        // Simulate a delay for processing before moving to the next step
        setTimeout(() => {
            onPay();
            // No need to setIsPaying(false) as the component will unmount
        }, 2000); // Simulate network delay
    };


    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <Card title="Order Summary">
                    <ul className="space-y-3">
                        {order.filter(item => item.quantity > 0).map(item => {
                            const planDetails = emailPlans.find(p => p.id === item.planId);
                            if (!planDetails) return null;
                            return (
                                <li key={item.planId} className="flex justify-between items-start text-sm">
                                    <div>
                                        <p className="font-medium text-[#293c51] dark:text-gray-200">{planDetails.name} x {item.quantity}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.subscriptionTerm} {item.subscriptionUnit}</p>
                                    </div>
                                    <p className="font-semibold text-gray-700 dark:text-gray-300">${(calculateOrderTotal([item])).toFixed(2)}</p>
                                </li>
                            );
                        })}
                    </ul>
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-baseline">
                        <span className="text-lg font-bold text-[#293c51] dark:text-gray-100">Total</span>
                        <span className="text-2xl font-bold text-[#679a41] dark:text-emerald-400">${totalAmount.toFixed(2)}</span>
                    </div>
                </Card>
            </div>
            <div>
                 <Card title="Payment Details">
                    <div className="flex flex-col items-center text-center space-y-6">
                        <p className="text-gray-600 dark:text-gray-400">Continue your payment securely with Stripe.</p>
                        <img 
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/2560px-Stripe_Logo%2C_revised_2016.svg.png" 
                            alt="Stripe Logo" 
                            className="h-12 object-contain"
                        />
                        <div className="flex items-start text-left text-xs text-gray-500 dark:text-gray-400 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                            <Icon name="fas fa-lock" className="mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                            <p>
                                You will be redirected to Stripe to complete your payment. We do not store any of your personal details or credit card information on our servers.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button type="button" variant="outline" onClick={onBack} disabled={isPaying}>Back</Button>
                        <Button onClick={handlePaymentRedirect} isLoading={isPaying} disabled={isPaying}>
                            {isPaying ? 'Processing...' : 'Pay with Stripe'}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

interface ConfirmationStepProps {
    onManageSubscriptions: () => void;
    onConfigureEmail: () => void;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({ onManageSubscriptions, onConfigureEmail }) => {
    const orderId = useMemo(() => `WP-POSTA-${Math.random().toString(36).substr(2, 9).toUpperCase()}`, []);
    return (
        <Card className="text-center py-10">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="fas fa-check" className="text-3xl text-green-600 dark:text-green-400"/>
            </div>
            <h2 className="text-2xl font-bold text-[#293c51] dark:text-gray-100">Payment Successful!</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Your Posta subscription has been activated.</p>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-500">Order ID: <span className="font-mono text-gray-700 dark:text-gray-300">{orderId}</span></p>
            <div className="mt-8 flex justify-center gap-4">
                <Button onClick={onManageSubscriptions} variant="outline">View Subscriptions</Button>
                <Button onClick={onConfigureEmail}>Configure Email</Button>
            </div>
        </Card>
    );
};


export const EmailAdminSubscriptionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);

  const [globalSubscriptionTerm, setGlobalSubscriptionTerm] = useState(1);
  const [globalSubscriptionUnit, setGlobalSubscriptionUnit] = useState<EmailPlanDuration>('monthly');

  const [orderConfiguration, setOrderConfiguration] = useState<ConfiguredPlan[]>(
    emailPlans.map(plan => ({
      planId: plan.id,
      quantity: 0,
      subscriptionTerm: 1,
      subscriptionUnit: 'monthly',
      advancedRulesEnabled: false,
    }))
  );

  useEffect(() => {
    const planIdFromUrl = searchParams.get('plan');
    const cycleFromUrl = searchParams.get('cycle');

    if (planIdFromUrl && emailPlans.some(p => p.id === planIdFromUrl)) {
      const newUnit = cycleFromUrl === 'annually' ? 'yearly' : 'monthly';
      setGlobalSubscriptionUnit(newUnit);

      setOrderConfiguration(prevConfigs =>
        prevConfigs.map(config =>
          config.planId === planIdFromUrl
            ? { ...config, quantity: 1, subscriptionUnit: newUnit }
            : { ...config, quantity: 0 }
        )
      );
    }
  }, [searchParams]);

  useEffect(() => {
    setOrderConfiguration(prev => prev.map(config => ({
      ...config,
      subscriptionTerm: globalSubscriptionTerm,
      subscriptionUnit: globalSubscriptionUnit
    })));
  }, [globalSubscriptionTerm, globalSubscriptionUnit]);

  const handlePlanChange = useCallback((changedConfig: ConfiguredPlan) => {
    setOrderConfiguration(prevConfigs => 
      prevConfigs.map(config => 
        config.planId === changedConfig.planId ? changedConfig : config
      )
    );
  }, []);
  
  const activeOrderConfiguration = useMemo(() => orderConfiguration.filter(item => item.quantity > 0), [orderConfiguration]);

  const currentOrderTotal = useMemo(() => {
    return calculateOrderTotal(activeOrderConfiguration);
  }, [activeOrderConfiguration]);

  const handleManageSubscriptions = () => {
    navigate('/app/billing');
  };

  const handleConfigureEmail = () => {
    navigate('/app/billing/email-configurations');
  };
  
  const isOrderProceedDisabled = activeOrderConfiguration.length === 0;

  const steps = [
    { name: 'Summary & Plan Selection' },
    { name: 'Payment Details' },
    { name: 'Confirmation' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[#293c51] dark:text-gray-100">Manage Posta Email Subscriptions</h1>
      
      <div className="w-full md:w-3/4 lg:w-1/2 mx-auto">
        <Stepper steps={steps} currentStep={currentStep} className="my-8" />
      </div>
      
      {currentStep === 0 && (
        <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-3/5 space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-[#293c51] dark:text-gray-100">Available Posta Plans</h2>
                    <Button variant="outline" size="sm" leftIconName="fas fa-external-link-alt" leftIconClassName="w-4 h-4" onClick={() => navigate('/posta-pricing')}>
                        Compare Plans
                    </Button>
                </div>
                <div className="grid grid-cols-1 gap-6">
                    {emailPlans.map(plan => (
                    <PlanCard 
                        key={plan.id} 
                        plan={plan} 
                        currentConfig={orderConfiguration.find(c => c.planId === plan.id)!}
                        onPlanChange={handlePlanChange} 
                    />
                    ))}
                </div>
            </div>
            <div className="lg:w-2/5">
                <SubscriptionSummaryCard 
                    order={orderConfiguration.filter(item => item.quantity > 0)} 
                    totalAmount={currentOrderTotal}
                    onProceed={() => setCurrentStep(1)}
                    isProceedDisabled={isOrderProceedDisabled}
                    globalSubscriptionTerm={globalSubscriptionTerm}
                    setGlobalSubscriptionTerm={setGlobalSubscriptionTerm}
                    globalSubscriptionUnit={globalSubscriptionUnit}
                    setGlobalSubscriptionUnit={setGlobalSubscriptionUnit}
                />
            </div>
        </div>
      )}
      
      {currentStep === 1 && (
        <PaymentStep
            order={activeOrderConfiguration}
            totalAmount={currentOrderTotal}
            onBack={() => setCurrentStep(0)}
            onPay={() => setCurrentStep(2)}
        />
      )}

      {currentStep === 2 && (
        <ConfirmationStep onManageSubscriptions={handleManageSubscriptions} onConfigureEmail={handleConfigureEmail} />
      )}
    </div>
  );
};
