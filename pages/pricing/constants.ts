
import type { PricingPlan, FeatureCategory, FaqItem } from '@/types';

export const PLANS: PricingPlan[] = [
  {
    id: 'light',
    name: 'Light Plan',
    priceMonthly: 1.80,
    priceAnnually: 1.50 * 12,
    priceAnnuallyPerMonth: 1.50,
    description: 'Essential tools for startups and individuals.',
    features: [
      '10GB mailbox',
      '2GB CloudSpace',
      '20 days restore deleted items',
      '20MB email attachment',
      '2 hosted domains',
      'Top-tier security',
      '100 attendees video conferences',
      'Connectivity Web only',
      'Team Chat',
      'Office Online',
      'Document Sharing',
      'AI Plugin',
    ],
  },
  {
    id: 'business',
    name: 'Business Plan',
    priceMonthly: 3.80,
    priceAnnually: 3.50 * 12,
    priceAnnuallyPerMonth: 3.50,
    description: 'For growing businesses needing more storage and tools.',
    features: [
      'Everything in Light, plus:',
      '100GB mailbox',
      '100GB CloudSpace',
      '40 days restore deleted items',
      '35MB email attachment',
      '5 hosted domains',
      '200 attendees video conferences',
      'Connectivity Web, Mobile, Outlook',
      'Video recording',
      'Mail Approval + Monitoring + Tracking',
    ],
    isRecommended: true,
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    priceMonthly: 5.50,
    priceAnnually: 5.00 * 12,
    priceAnnuallyPerMonth: 5.00,
    description: 'Advanced security and data control for businesses.',
    features: [
      'Everything in Business, plus:',
      '200GB mailbox',
      '1TB CloudSpace',
      '60 days restore deleted items',
      '100MB email attachment',
      '10 hosted domains',
      '1000 attendees video conferences',
      'Archiving & Encryption',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    priceMonthly: 10.90,
    priceAnnually: 10.00 * 12,
    priceAnnuallyPerMonth: 10.00,
    description: 'Extensive storage and security for large organizations.',
    features: [
      'Everything in Pro, plus:',
      '1TB mailbox',
      '5TB CloudSpace',
      '100 days restore deleted items',
      '150MB email attachment',
      'Unlimited domains',
    ],
  },
];

export const FEATURE_CATEGORIES: FeatureCategory[] = [
  {
    name: 'Storage & Limits',
    features: [
      { name: 'Mailbox Size', availability: { light: '10GB', business: '100GB', pro: '200GB', enterprise: '1TB' } },
      { name: 'CloudSpace', availability: { light: '2GB', business: '100GB', pro: '1TB', enterprise: '5TB' } },
      { name: 'Restore Deleted Items', availability: { light: '20 days', business: '40 days', pro: '60 days', enterprise: '100 days' } },
      { name: 'Email Attachment Size', availability: { light: '20MB', business: '35MB', pro: '100MB', enterprise: '150MB' } },
    ],
  },
  {
    name: 'Domains',
    features: [
      { name: 'Hosted Domains', availability: { light: '2', business: '5', pro: '10', enterprise: 'Unlimited' } },
    ],
  },
  {
    name: 'Collaboration & Conferencing',
    features: [
      { name: 'Video Conference Attendees', availability: { light: '100', business: '200', pro: '1000', enterprise: '1000' } },
      { name: 'Video Recording', availability: { light: false, business: true, pro: true, enterprise: true } },
      { name: 'Connectivity', availability: { light: 'Web only', business: 'Web, Mobile, Outlook', pro: 'Web, Mobile, Outlook', enterprise: 'Web, Mobile, Outlook' } },
      { name: 'Team Chat', availability: { light: true, business: true, pro: true, enterprise: true } },
      { name: 'Office Online', availability: { light: true, business: true, pro: true, enterprise: true } },
      { name: 'Document Sharing', availability: { light: true, business: true, pro: true, enterprise: true } },
    ],
  },
  {
    name: 'Advanced Features & Security',
    features: [
      { name: 'Top-tier security', availability: { light: true, business: true, pro: true, enterprise: true } },
      { name: 'AI Plugin', availability: { light: true, business: true, pro: true, enterprise: true } },
      { name: 'Mail Approval + Monitoring + Tracking', availability: { light: false, business: true, pro: true, enterprise: true } },
      { name: 'Archiving & Encryption', availability: { light: false, business: false, pro: true, enterprise: true } },
    ],
  },
];


export const FAQS: FaqItem[] = [
  {
    question: 'Can I change my plan later?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time from your billing dashboard. Changes will be pro-rated for the current billing cycle.',
  },
  {
    question: 'Do you offer discounts for non-profits or educational institutions?',
    answer: 'We do! Please contact our sales team with your organization\'s details, and we can provide you with information about our special pricing programs.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. For annual enterprise plans, we can also support wire transfers.',
  },
  {
    question: 'Is there a free trial available?',
    answer: 'While we don\'t offer a traditional free trial, we do have a 30-day money-back guarantee. If you\'re not satisfied for any reason within the first 30 days, we\'ll issue a full refund, no questions asked.',
  },
  {
    question: 'Can I use my own domain name?',
    answer: 'Absolutely! All our plans are designed to work with your custom domain name to give your business a professional appearance.',
  },
];