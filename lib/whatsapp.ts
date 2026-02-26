import { CURRENCY } from '@/lib/currency';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

type WhatsAppLinkParams = {
  itemId: string;
  title: string;
  price: number;
  currency?: string;
};

export function buildWhatsAppLink({ itemId, title, price, currency = CURRENCY }: WhatsAppLinkParams): string {
  const message = encodeURIComponent(
    `Hi! I'm interested in this item from your catalog:\n\n` +
    `*${title}*\n` +
    `Item ID: ${itemId}\n` +
    `Price: ${currency} ${price.toLocaleString()}\n\n` +
    `Is this still available?`
  );
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}
