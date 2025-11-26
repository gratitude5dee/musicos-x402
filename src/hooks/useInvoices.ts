import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MusicInvoice, InvoiceFilters, LineItem } from '@/types/invoice';
import { Json } from '@/integrations/supabase/types';
import { mockInvoices } from '@/lib/finances/__mocks__/invoice-fixtures';

export const useInvoices = (filters?: InvoiceFilters) => {
  return useQuery({
    queryKey: ['invoices', filters],
    queryFn: async () => {
      // Check if user is in guest mode
      const isGuestMode = localStorage.getItem('guest_mode') === 'true';
      
      if (isGuestMode) {
        // Return mock data for guest mode
        let filtered = mockInvoices;
        if (filters?.status && filters.status !== 'all') {
          filtered = filtered.filter(inv => inv.status === filters.status);
        }
        return filtered;
      }

      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Return mock data for unauthenticated users
        let filtered = mockInvoices;
        if (filters?.status && filters.status !== 'all') {
          filtered = filtered.filter(inv => inv.status === filters.status);
        }
        return filtered;
      }

      let query = supabase
        .from('invoices')
        .select(`
          *,
          gigs!invoices_gig_id_fkey (
            id,
            title,
            date,
            venue_id,
            venues!gigs_venue_id_fkey (
              name
            )
          )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      // Apply status filter
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      // Apply date range filter
      if (filters?.startDate) {
        query = query.gte('due_date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('due_date', filters.endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Map database records to MusicInvoice type
      const invoices: MusicInvoice[] = (data || []).map((invoice) => {
        // Parse line_items JSON to LineItem array
        const lineItems: LineItem[] = [];
        if (invoice.line_items) {
          try {
            const parsed = Array.isArray(invoice.line_items) 
              ? invoice.line_items 
              : [invoice.line_items];
            
            parsed.forEach((item: any) => {
              if (item && typeof item === 'object') {
                lineItems.push({
                  description: item.description || '',
                  amount: item.amount || 0,
                  quantity: item.quantity || 1,
                });
              }
            });
          } catch (e) {
            console.error('Error parsing line items:', e);
          }
        }

        return {
          ...invoice,
          line_items: lineItems,
          client_name: invoice.gigs?.venues?.name || undefined,
          venue_name: invoice.gigs?.venues?.name || undefined,
          gig: invoice.gigs ? {
            title: invoice.gigs.title,
            venue_name: invoice.gigs.venues?.name,
            date: invoice.gigs.date,
          } : undefined,
        };
      });

      return invoices;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};
