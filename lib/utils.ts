import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CURRENCY } from '@/lib/currency';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatPrice(amount: number, currency: string = CURRENCY): string {
  return `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function generateSKU(category: string, sequence: number): string {
  const prefixes: Record<string, string> = {
    laptop: 'LAP',
    desktop: 'DSK',
    tablet: 'TAB',
    phone: 'PHN',
    accessory: 'ACC',
    other: 'OTH',
  };
  const prefix = prefixes[category] || 'OTH';
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${String(sequence).padStart(3, '0')}`;
}
