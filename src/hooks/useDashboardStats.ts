import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  total_gigs: number;
  upcoming_gigs: number;
  pending_gigs: number;
  total_revenue: number;
  unpaid_invoices_count: number;
  unpaid_invoices_amount: number;
  overdue_invoices_count: number;
  avg_payment_days: number;
  total_contacts: number;
  total_venues: number;
}

const mockDashboardStats: DashboardStats = {
  total_gigs: 12,
  upcoming_gigs: 5,
  pending_gigs: 3,
  total_revenue: 245000,
  unpaid_invoices_count: 4,
  unpaid_invoices_amount: 112540,
  overdue_invoices_count: 1,
  avg_payment_days: 18,
  total_contacts: 47,
  total_venues: 23,
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Check if user is in guest mode
      const isGuestMode = localStorage.getItem('guest_mode') === 'true';
      
      if (isGuestMode) {
        // Return mock data for guest mode
        return mockDashboardStats;
      }

      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Return mock data for unauthenticated users
        return mockDashboardStats;
      }

      // Call edge function for authenticated users
      const { data, error } = await supabase.functions.invoke('get-dashboard-stats');
      
      if (error) {
        console.error('Error fetching dashboard stats:', error);
        // Return mock data on error
        return mockDashboardStats;
      }
      
      return data as DashboardStats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
