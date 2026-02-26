export interface PageView {
  id: string;
  item_id: string;
  session_id: string;
  viewed_at: string;
  referrer: string | null;
  user_agent: string | null;
}

export interface Inquiry {
  id: string;
  item_id: string;
  session_id: string;
  source: 'whatsapp' | 'form';
  message: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  inquired_at: string;
}

export interface ItemAnalytics {
  id: string;
  title: string;
  sku: string;
  status: string;
  views_7d: number;
  views_30d: number;
  inquiries_7d: number;
  inquiries_30d: number;
  conversion_pct_30d: number | null;
}
