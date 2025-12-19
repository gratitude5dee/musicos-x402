import React, { useState } from 'react';
import { useActiveAccount, useActiveWallet } from 'thirdweb/react';
import { wrapFetchWithPayment } from 'thirdweb/x402';
import { createThirdwebClient } from 'thirdweb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface X402InvoicePaymentProps {
  invoiceId: string;
  amount: number;
  currency: string;
  sellerWalletAddress: string;
  onPaymentComplete: (transactionId: string) => void;
}

export const X402InvoicePayment: React.FC<X402InvoicePaymentProps> = ({
  invoiceId,
  amount,
  currency,
  sellerWalletAddress,
  onPaymentComplete,
}) => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { toast } = useToast();

  const client = createThirdwebClient({
    clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID,
  });

  const handlePayment = async () => {
    if (!wallet || !account) {
      setError('Please connect your wallet first');
      return;
    }

    setIsPending(true);
    setError(null);

    try {
      // Create payment-wrapped fetch using wallet (not account)
      const fetchWithPayment = wrapFetchWithPayment(fetch, client, wallet);

      // Call the x402-protected payment endpoint
      const response = await fetchWithPayment(
        `/api/invoices/${invoiceId}/pay`,
        { method: 'POST' }
      );

      // wrapFetchWithPayment returns the response object, we need to parse it if it's JSON
      // However, the prompt code implies it returns an object with `success` property directly?
      // Wait, wrapFetchWithPayment usually returns a Response object.
      // Let's check if the prompt code assumed a wrapper that returns JSON.
      // The prompt code:
      // if (response.success) { ... }

      // If `fetchWithPayment` mimics `fetch`, it returns a `Response`.
      // I should probably do `const data = await response.json();` if it's a Response.
      // But looking at the prompt code: `if (response.success)`...
      // Maybe the prompt assumes `wrapFetchWithPayment` returns the data directly?
      // I'll stick to the prompt code but I'll add a check.

      let data: any = response;
      if (response instanceof Response) {
         data = await response.json();
      }

      if (data.success) {
        toast({
          title: 'Payment Successful',
          description: `Invoice paid: ${amount} ${currency}`,
        });
        onPaymentComplete(data.transactionId);
      } else {
        throw new Error(data.error || 'Payment failed');
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Payment Failed',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Pay Invoice with x402
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
          <span className="text-muted-foreground">Amount Due</span>
          <span className="text-2xl font-bold">{amount} {currency}</span>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <Button
          onClick={handlePayment}
          disabled={isPending || !wallet || !account}
          className="w-full"
          size="lg"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Pay {amount} {currency}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
