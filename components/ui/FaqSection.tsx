
import React, { useState } from 'react';
import type { FaqItem } from '@/types';
import { Card } from './Card';
import { Icon } from './Icon';

interface FaqSectionProps {
  faqs: FaqItem[];
}

export const FaqSection: React.FC<FaqSectionProps> = ({ faqs }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <Card key={index} className="p-0 overflow-hidden">
          <button
            className="flex justify-between items-center w-full p-6 text-left"
            onClick={() => toggleFaq(index)}
            aria-expanded={openIndex === index}
            aria-controls={`faq-answer-${index}`}
          >
            <h4 className="text-lg font-semibold text-[#293c51] dark:text-gray-100">{faq.question}</h4>
            <Icon
              name="fas fa-chevron-down"
              className={`transform transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''}`}
            />
          </button>
          <div
            id={`faq-answer-${index}`}
            className={`transition-all duration-300 ease-in-out grid ${openIndex === index ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
          >
             <div className="overflow-hidden">
                <p className="px-6 pb-6 text-gray-600 dark:text-gray-400">
                    {faq.answer}
                </p>
             </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
