
import React from 'react';
import type { PricingPlan, FeatureCategory } from '@/types';
import { Card } from './Card';
import { Icon } from './Icon';

interface FeatureComparisonProps {
  plans: PricingPlan[];
  featureCategories: FeatureCategory[];
}

export const FeatureComparison: React.FC<FeatureComparisonProps> = ({ plans, featureCategories }) => {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white dark:bg-slate-800 py-4 px-2 text-left font-semibold text-lg text-[#293c51] dark:text-gray-100">Features</th>
              {plans.map(plan => (
                <th key={plan.id} className="p-2 text-center w-1/5">
                  <div className={`p-4 rounded-lg ${plan.isRecommended ? 'bg-green-50 dark:bg-emerald-900/40' : ''}`}>
                    <h4 className="text-base font-bold text-[#293c51] dark:text-gray-200">{plan.name}</h4>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {featureCategories.map(category => (
              <React.Fragment key={category.name}>
                <tr className="bg-gray-50 dark:bg-slate-800/50">
                  <td colSpan={plans.length + 1} className="pt-6 pb-2 px-2">
                    <h5 className="text-base font-semibold text-[#293c51] dark:text-gray-200">{category.name}</h5>
                  </td>
                </tr>
                {category.features.map(feature => (
                  <tr key={feature.name} className="border-b border-gray-200 dark:border-slate-700 last:border-b-0">
                    <td className="sticky left-0 bg-white dark:bg-slate-800 py-4 px-2 text-gray-600 dark:text-gray-400 z-10">{feature.name}</td>
                    {plans.map(plan => {
                      const availability = feature.availability[plan.id];
                      return (
                        <td key={plan.id} className="p-2 text-center align-middle">
                          {typeof availability === 'boolean' && availability ? (
                            <Icon name="fas fa-check" className="text-green-500 dark:text-green-400 text-lg mx-auto" />
                          ) : typeof availability === 'string' ? (
                            <span className="text-gray-800 dark:text-gray-200">{availability}</span>
                          ) : (
                             <Icon name="fas fa-minus" className="text-gray-400 dark:text-gray-500 text-lg mx-auto" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
