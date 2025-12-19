import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Receipt, Plus, Trash2, Loader2, Download, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { X402InvoicePayment } from "@/components/invoices/X402InvoicePayment";
import type { Database } from "@/integrations/supabase/types";

interface LineItem {
  id: string;
  description: string;
  amount: number;
  quantity?: number;
}

interface InvoiceTotals {
  subtotal: number;
  tax: number;
  total: number;
  balanceDue: number;
}

interface InvoiceResponse {
  invoiceId: string;
  invoiceNumber: string;
  dueDate: string;
  currency: string;
  totals: InvoiceTotals;
  lineItems: Array<{ description: string; amount: number; quantity?: number }>;
}

interface InvoiceGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  bookingDetails: {
    venueName: string;
    offerAmount?: number;
  };
}

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ??
  "https://ixkkrousepsiorwlaycp.supabase.co";

export const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({
  open,
  onOpenChange,
  bookingId,
  bookingDetails,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceResponse | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: "1", description: "Performance Fee", amount: bookingDetails.offerAmount || 2500, quantity: 1 },
    { id: "2", description: "Sound & Lighting", amount: 500, quantity: 1 },
    { id: "3", description: "Travel Expenses", amount: 300, quantity: 1 }
  ]);
  const [taxRate, setTaxRate] = useState<number>(0);

  const calculatedTotals = useMemo(() => {
    const subtotal = lineItems.reduce((sum, item) => sum + (Number(item.amount) || 0) * (item.quantity ?? 1), 0);
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;
    return {
      subtotal,
      tax,
      total,
      balanceDue: total
    };
  }, [lineItems, taxRate]);

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        description: "",
        amount: 0,
        quantity: 1
      }
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: field === "description" ? value : Number(value) || 0
            }
          : item
      )
    );
  };

  

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        throw new Error("No active session found. Please sign in again.");
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-invoice`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          bookingId,
          taxRate,
          lineItems: lineItems.map(({ description, amount, quantity }) => ({
            description,
            amount,
            quantity: quantity ?? 1
          }))
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create invoice");
      }

      const payload: InvoiceResponse = await response.json();
      setInvoice(payload);

      toast({
        title: "Invoice created!",
        description: `Invoice ${payload.invoiceNumber} has been generated.`,
      });
    } catch (error: unknown) {
      console.error("Error generating invoice:", error);
      const message = error instanceof Error ? error.message : 'Failed to create invoice. Please try again.';
      toast({
        title: "Generation failed",
        description: message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = () => {
    if (!invoice) return;

    const totals = invoice?.totals ?? calculatedTotals;
    const invoiceText = `
INVOICE

Invoice Number: ${invoice.invoiceNumber}
Venue: ${bookingDetails.venueName}
Date: ${new Date().toLocaleDateString()}
Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}

LINE ITEMS:
${invoice.lineItems.map((item) => `${item.description} (${item.quantity ?? 1}x): $${item.amount.toFixed(2)}`).join("\n")}

Subtotal: $${totals.subtotal.toFixed(2)}
Tax: $${totals.tax.toFixed(2)}
TOTAL: $${totals.total.toFixed(2)} ${invoice.currency}
Balance Due: $${totals.balanceDue.toFixed(2)}

Payment Terms: Net 30 days
`;

    const blob = new Blob([invoiceText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${invoice.invoiceNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: "Invoice saved to your downloads",
    });
  };

  const invoiceTotals = invoice?.totals ?? calculatedTotals;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Receipt className="h-6 w-6 text-primary" />
            {invoice ? "Invoice Generated" : "Create Invoice"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {invoice
              ? `Invoice for ${bookingDetails.venueName}`
              : `Generate an invoice for ${bookingDetails.venueName}`}
          </DialogDescription>
        </DialogHeader>

        {!invoice ? (
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold text-foreground">Line Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                {lineItems.map((item) => (
                  <div key={item.id} className="flex gap-3 items-start p-3 bg-background/50 rounded-lg border border-border">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Description (e.g., Performance Fee)"
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                        className="bg-background border-border"
                      />
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={item.amount || ""}
                          onChange={(e) => updateLineItem(item.id, "amount", parseFloat(e.target.value) || 0)}
                          className="bg-background border-border"
                          step="0.01"
                        />
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity ?? 1}
                          onChange={(e) => updateLineItem(item.id, "quantity", parseInt(e.target.value, 10) || 1)}
                          className="bg-background border-border w-24"
                          min={1}
                        />
                      </div>
                    </div>
                    {lineItems.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLineItem(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-background/40 p-4 rounded-lg border border-border">
              <div>
                <p className="text-sm text-muted-foreground">Subtotal</p>
                <p className="text-lg font-semibold">${invoiceTotals.subtotal.toFixed(2)}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Tax %</Label>
                <Input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="mt-1 bg-background border-border"
                />
                <p className="text-xs text-muted-foreground mt-1">Tax: ${invoiceTotals.tax.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-lg font-semibold">${invoiceTotals.total.toFixed(2)}</p>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Invoice
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Invoice
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="bg-background/40 border border-border rounded-lg p-4 space-y-2">
              <p className="text-sm text-muted-foreground">Invoice Number</p>
              <p className="text-lg font-semibold">{invoice.invoiceNumber}</p>
              <p className="text-sm text-muted-foreground">Due Date</p>
              <p className="text-lg font-semibold">{new Date(invoice.dueDate).toLocaleDateString()}</p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Line Items</h4>
              <div className="space-y-2">
                {invoice.lineItems.map((item, index) => (
                  <div key={`${item.description}-${index}`} className="flex items-center justify-between bg-background/40 border border-border rounded-md px-3 py-2">
                    <div>
                      <p className="font-medium text-foreground">{item.description}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity ?? 1}</p>
                    </div>
                    <p className="font-semibold text-foreground">${item.amount.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-background/40 border border-border rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${invoiceTotals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium">${invoiceTotals.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>${invoiceTotals.total.toFixed(2)} {invoice.currency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Balance Due</span>
                <span className="font-medium">${invoiceTotals.balanceDue.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" className="flex-1" onClick={downloadInvoice}>
                <Download className="mr-2 h-4 w-4" />
                Download Invoice
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setInvoice(null);
                  setLoading(false);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Another
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <X402InvoicePayment
                invoiceId={invoice.invoiceId}
                amount={invoice.totals.total}
                currency={invoice.currency}
                sellerWalletAddress="0x0000000000000000000000000000000000000000"
                onPaymentComplete={(txId) => {
                  setInvoice(null);
                  setLoading(false);
                }}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

