import { ContactInfo } from './types';

// Currency Configuration
export const CURRENCY_CONFIG: Record<string, { symbol: string, rate: number, code: string }> = {
    'USA': { symbol: '$', rate: 1, code: 'USD' },
    'India': { symbol: '₹', rate: 84, code: 'INR' },
    'UK': { symbol: '£', rate: 0.79, code: 'GBP' },
    'Europe': { symbol: '€', rate: 0.92, code: 'EUR' },
    'Canada': { symbol: 'C$', rate: 1.36, code: 'CAD' },
    'Australia': { symbol: 'A$', rate: 1.52, code: 'AUD' },
    'UAE': { symbol: 'AED ', rate: 3.67, code: 'AED' },
};

export const SUPPORTED_COUNTRIES = Object.keys(CURRENCY_CONFIG).sort();

// Helper to format price based on country
export const formatPrice = (amountInUSD: number, country: string = 'India') => {
    const config = CURRENCY_CONFIG[country] || CURRENCY_CONFIG['India'];
    const val = amountInUSD * config.rate;
    
    const locale = config.code === 'INR' ? 'en-IN' : 'en-US';

    // Use Intl for proper formatting
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: config.code,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(val);
};

export const INITIAL_CONTACT_INFO: ContactInfo = {
  email: 'vbuilt20@gmail.com',
  phone: '', 
  instagram: 'visionbuilt03',
  whatsapp: ''
};