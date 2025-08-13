
import React from 'react';
import type { PricingPlan } from '@/types';
import { Card } from './Card';
import { Button } from './Button';
import { Icon } from './Icon';

interface PricingCardProps {
  plan: PricingPlan;
  billingCycle: 'monthly' | 'annually';
  onChoosePlan: (planId: string) => void;
}

export const PricingCard: React.FC<PricingCardProps> = ({ plan, billingCycle, onChoosePlan }) => {
  const price = billingCycle === 'annually' ? plan.priceAnnuallyPerMonth : plan.priceMonthly;
  const priceUnit = '/user/month';

  const descriptiveFeature = plan.features.find(f => f.startsWith('Everything in'));
  const regularFeatures = plan.features.filter(f => !f.startsWith('Everything in'));

  return (
    <Card className={`relative flex flex-col h-full border-2 ${plan.isRecommended ? 'border-[#679a41] dark:border-emerald-500' : 'border-gray-200 dark:border-slate-700'} hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
      <div className={`absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-semibold tracking-wider text-white uppercase bg-[#679a41] dark:bg-emerald-500 rounded-full z-10 transition-opacity duration-300 ${plan.isRecommended ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        Recommended
      </div>
      
      <div className="text-left flex-grow flex flex-col">
        <h3 className="text-2xl font-extrabold text-[#293c51] dark:text-gray-100">{plan.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 min-h-[40px]">{plan.description}</p>
        
        <div className="my-1">
          <div className="flex items-baseline">
            <span className="text-4xl font-extrabold text-[#293c51] dark:text-gray-100">${price.toFixed(2)}</span>
            <span className="ml-1.5 text-base text-gray-500 dark:text-gray-400">{priceUnit}</span>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {billingCycle === 'annually' ? 'Billed annually' : 'Billed monthly'}
          </p>
        </div>
        <Button 
          fullWidth 
          variant={plan.isRecommended ? 'primary' : 'outline'}
          onClick={() => onChoosePlan(plan.id)}
          size="lg"
          className="my-4"
        >
          Buy now
        </Button>
        <div className="flex-grow">
          {descriptiveFeature && (
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4">{descriptiveFeature}</p>
          )}
          <ul className="space-y-3">
            {regularFeatures.map((feature, index) => (
              <li key={index} className="flex items-start">
                <Icon name="far fa-check-circle" className="text-[#679a41] dark:text-emerald-400 mt-1 mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        
      </div>
    </Card>
  );
};