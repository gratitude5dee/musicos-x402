import type { Database } from '@/integrations/supabase/types';

// Base invoice type from Supabase
export type DbInvoice = Database['public']['Tables']['invoices']['Row'];

// Extended invoice type with UI-specific fields
export interface MusicInvoice extends Omit<DbInvoice, 'line_items'> {
  invoice_type?: 'performance' | 'production' | 'royalty' | 'tour_expense' | 'licensing' | 'merchandise' | 'studio_rental' | 'other';
  client_name?: string;
  venue_name?: string;
  line_items: LineItem[];
  gig?: {
    title?: string;
    venue_name?: string;
    date?: string;
  };
}

export interface LineItem {
  description: string;
  amount: number;
  quantity: number;
}

export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceFilters {
  status?: InvoiceStatus | 'all';
  search?: string;
  dateRange?: 'all' | 'month' | 'quarter' | 'year';
  startDate?: string;
  endDate?: string;
}

export interface InvoiceSortConfig {
  field: 'invoice_number' | 'client_name' | 'amount' | 'due_date' | 'status' | 'created_at';
  direction: 'asc' | 'desc';
}
