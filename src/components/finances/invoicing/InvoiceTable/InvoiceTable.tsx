import React, { useState, useMemo } from 'react';
import { MusicInvoice, InvoiceStatus, InvoiceSortConfig } from '@/types/invoice';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils/formatters';
import { ArrowUpDown, FileX } from 'lucide-react';
import { format } from 'date-fns';

interface InvoiceTableProps {
  invoices: MusicInvoice[];
  onRowClick?: (invoice: MusicInvoice) => void;
  isLoading?: boolean;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  onRowClick,
  isLoading = false,
}) => {
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [sortConfig, setSortConfig] = useState<InvoiceSortConfig>({
    field: 'created_at',
    direction: 'desc',
  });

  // Filter invoices by status
  const filteredInvoices = useMemo(() => {
    if (statusFilter === 'all') return invoices;
    return invoices.filter((inv) => inv.status === statusFilter);
  }, [invoices, statusFilter]);

  // Sort invoices
  const sortedInvoices = useMemo(() => {
    const sorted = [...filteredInvoices];
    sorted.sort((a, b) => {
      const direction = sortConfig.direction === 'asc' ? 1 : -1;

      switch (sortConfig.field) {
        case 'invoice_number':
          return direction * (a.invoice_number || '').localeCompare(b.invoice_number || '');
        case 'client_name':
          return direction * (a.client_name || '').localeCompare(b.client_name || '');
        case 'amount':
          return direction * (a.amount - b.amount);
        case 'due_date':
          return direction * ((a.due_date || '').localeCompare(b.due_date || ''));
        case 'status':
          return direction * (a.status || '').localeCompare(b.status || '');
        case 'created_at':
          return direction * ((a.created_at || '').localeCompare(b.created_at || ''));
        default:
          return 0;
      }
    });
    return sorted;
  }, [filteredInvoices, sortConfig]);

  const handleSort = (field: InvoiceSortConfig['field']) => {
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getStatusBadgeStatus = (status: string | null) => {
    switch (status) {
      case 'paid':
        return 'active';
      case 'sent':
      case 'viewed':
        return 'info';
      case 'overdue':
        return 'error';
      case 'draft':
      default:
        return 'default';
    }
  };

  const formatInvoiceType = (type?: string) => {
    if (!type) return 'Other';
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'N/A';
    }
  };

  const formatStatusText = (status: string | null) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="invoice-skeleton">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (sortedInvoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileX className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground">No invoices found</h3>
        <p className="text-sm text-muted-foreground mt-2">
          {statusFilter !== 'all'
            ? `No ${statusFilter} invoices to display`
            : 'Create your first invoice to get started'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as InvoiceStatus | 'all')}>
          <SelectTrigger className="w-[180px] bg-background/50 border-border">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="viewed">Viewed</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border border-border bg-background/30 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead
                role="columnheader"
                className="cursor-pointer select-none"
                onClick={() => handleSort('invoice_number')}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleSort('invoice_number')}
              >
                <div className="flex items-center gap-2">
                  Invoice #
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead
                role="columnheader"
                className="cursor-pointer select-none"
                onClick={() => handleSort('client_name')}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleSort('client_name')}
              >
                <div className="flex items-center gap-2">
                  Client
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead
                role="columnheader"
                className="cursor-pointer select-none"
                onClick={() => handleSort('amount')}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleSort('amount')}
              >
                <div className="flex items-center gap-2">
                  Amount
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead
                role="columnheader"
                className="cursor-pointer select-none"
                onClick={() => handleSort('due_date')}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleSort('due_date')}
              >
                <div className="flex items-center gap-2">
                  Due Date
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead
                role="columnheader"
                className="cursor-pointer select-none"
                onClick={() => handleSort('status')}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleSort('status')}
              >
                <div className="flex items-center gap-2">
                  Status
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedInvoices.map((invoice) => (
              <TableRow
                key={invoice.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors border-border"
                onClick={() => onRowClick?.(invoice)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onRowClick?.(invoice);
                  }
                }}
                tabIndex={0}
              >
                <TableCell className="font-medium text-foreground">
                  {invoice.invoice_number || 'N/A'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatInvoiceType(invoice.invoice_type)}
                </TableCell>
                <TableCell className="text-foreground">
                  {invoice.client_name || invoice.gig?.venue_name || 'Unknown Client'}
                </TableCell>
                <TableCell className="font-semibold text-foreground">
                  {formatCurrency(invoice.amount)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(invoice.due_date)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={getStatusBadgeStatus(invoice.status)}>
                    {formatStatusText(invoice.status)}
                  </StatusBadge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {sortedInvoices.length} of {invoices.length} invoices
      </div>
    </div>
  );
};
