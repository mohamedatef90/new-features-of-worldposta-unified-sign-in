import React from 'react';
import type { StepperStep } from '@/types';
import { Icon } from './Icon';

export const Stepper: React.FC<{ steps: StepperStep[]; currentStep: number; className?: string }> = ({ steps, currentStep, className }) => {
  const progressPercentage = steps.length > 1 ? (100 / (steps.length - 1)) * currentStep : 0;
  
  return (
    <nav aria-label="Progress" className={`w-full ${className}`}>
      <div className="relative">
        <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 dark:bg-slate-700 rounded-full" aria-hidden="true" />
        
        <div
          className="absolute top-5 left-0 h-1 bg-[#679a41] dark:bg-emerald-500 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${progressPercentage}%` }}
        />
        
        <ol role="list" className="relative flex justify-between items-start">
          {steps.map((step, stepIdx) => {
            const isCompleted = stepIdx < currentStep;
            const isCurrent = stepIdx === currentStep;

            return (
              <li key={step.name} className="flex flex-col items-center text-center w-28">
                <div
                  className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 z-10 bg-white dark:bg-slate-800
                    ${isCompleted ? 'border-2 border-[#679a41] dark:border-emerald-500' : ''}
                    ${isCurrent ? 'border-2 border-[#679a41] dark:border-emerald-500 ring-4 ring-[#a3cc85]/50 dark:ring-emerald-700/50' : ''}
                    ${!isCompleted && !isCurrent ? 'border-2 border-gray-300 dark:border-slate-600' : ''}
                  `}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <Icon name="fas fa-check" className="w-5 h-5 text-[#679a41] dark:text-emerald-400" aria-hidden="true" />
                  ) : (
                    <span className={`text-base font-bold 
                      ${isCurrent ? 'text-[#679a41] dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                      {stepIdx + 1}
                    </span>
                  )}
                </div>
                <p className={`mt-2 text-xs md:text-sm font-medium transition-colors duration-300
                  ${isCompleted || isCurrent ? 'text-[#293c51] dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}
                `}>
                  {step.name}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};
