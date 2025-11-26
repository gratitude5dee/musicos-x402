import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Plus, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  Calendar,
  Star,
  Zap,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Download
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/layouts/dashboard-layout";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { InvoiceTable } from "@/components/finances/invoicing/InvoiceTable";
import { useInvoices } from "@/hooks/useInvoices";
import { InvoiceStatus } from "@/types/invoice";

const Invoices = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useDashboardStats();
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const { data: invoices = [], isLoading: isLoadingInvoices } = useInvoices({ 
    status: statusFilter 
  });

  const QuickActions = () => (
    <div className="mb-8">
      <div className="flex items-center mb-6">
        <Zap className="h-5 w-5 text-white mr-2" />
        <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => navigate("/event-toolkit/invoices/create")}
        >
          <Card className="bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500/30 transition-colors">
                <Plus className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-white font-medium mb-1">New Invoice</h3>
              <p className="text-blue-lightest/70 text-sm">Create billing</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-green-500/30 transition-colors">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-white font-medium mb-1">Mark Paid</h3>
              <p className="text-blue-lightest/70 text-sm">Update status</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500/30 transition-colors">
                <Download className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-white font-medium mb-1">Export</h3>
              <p className="text-blue-lightest/70 text-sm">Download reports</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-500/30 transition-colors">
                <BarChart3 className="h-6 w-6 text-orange-400" />
              </div>
              <h3 className="text-white font-medium mb-1">Analytics</h3>
              <p className="text-blue-lightest/70 text-sm">Payment trends</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );

  const PerformanceMetrics = () => (
    <div className="mb-8">
      <div className="flex items-center mb-6">
        <TrendingUp className="h-5 w-5 text-white mr-2" />
        <h2 className="text-lg font-semibold text-white">Invoice Metrics</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/5 backdrop-blur-md border border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Unpaid Invoices</h3>
              <FileText className="h-5 w-5 text-green-400" />
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-white">
                ${isLoading ? '...' : (stats?.unpaid_invoices_amount || 0).toFixed(2)}
              </div>
              <div className={`text-sm ${(stats?.unpaid_invoices_amount || 0) === 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                {(stats?.unpaid_invoices_amount || 0) === 0 ? 'All clear' : `${stats?.unpaid_invoices_count || 0} unpaid`}
              </div>
              <div className="text-xs text-blue-lightest/70">
                {stats?.overdue_invoices_count || 0} overdue
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-md border border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Total Revenue</h3>
              <DollarSign className="h-5 w-5 text-blue-400" />
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-white">
                ${isLoading ? '...' : (stats?.total_revenue || 0).toFixed(2)}
              </div>
              <div className="text-sm text-green-400">Total revenue</div>
              <div className="text-xs text-blue-lightest/70">All paid invoices</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-md border border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Avg Payment Time</h3>
              <Clock className="h-5 w-5 text-purple-400" />
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-white">
                {isLoading ? '...' : (stats?.avg_payment_days || 0)}
              </div>
              <div className="text-sm text-green-400">Days</div>
              <div className="text-xs text-blue-lightest/70">Average turnaround</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-md border border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Collection Rate</h3>
              <CheckCircle className="h-5 w-5 text-orange-400" />
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-white">
                {isLoading ? '...' : stats?.total_revenue && stats?.unpaid_invoices_amount 
                  ? Math.round((stats.total_revenue / (stats.total_revenue + stats.unpaid_invoices_amount)) * 100)
                  : 0}%
              </div>
              <div className="text-sm text-green-400">Collection rate</div>
              <div className="text-xs text-blue-lightest/70">Payment success</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <Star className="h-6 w-6 text-white mr-3" />
            <h1 className="text-2xl font-bold text-white">Invoices</h1>
          </div>
          <p className="text-blue-lightest/70">Track your performance payments and billing</p>
        </div>

        <QuickActions />
        <PerformanceMetrics />

        {/* Invoice Table */}
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-white/5 backdrop-blur-md border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">All Invoices</h3>
                <Button 
                  onClick={() => navigate("/event-toolkit/invoices/create")}
                  className="bg-blue-primary hover:bg-blue-primary/80 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Invoice
                </Button>
              </div>
              
              <InvoiceTable 
                invoices={invoices}
                isLoading={isLoadingInvoices}
                onRowClick={(invoice) => {
                  console.log('Invoice clicked:', invoice);
                  // TODO: Navigate to invoice detail page
                }}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Invoices;