import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Play
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface RoyaltySplit {
  id: string;
  recipientName: string;
  recipientAddress: string;
  percentage: number;
  role: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  amount: number;
  transactionHash?: string;
}

interface DistributionBatch {
  id: string;
  assetName: string;
  totalAmount: number;
  period: string;
  splits: RoyaltySplit[];
  status: 'pending' | 'processing' | 'completed' | 'partial';
  completedAt?: string;
}

export const RoyaltyDistributionDashboard: React.FC = () => {
  const [batches, setBatches] = useState<DistributionBatch[]>([]);
  const [processingBatchId, setProcessingBatchId] = useState<string | null>(null);
  const [currentProgress, setCurrentProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingDistributions();
  }, []);

  const fetchPendingDistributions = async () => {
    try {
      const response = await fetch('/api/royalties/pending');
      const data = await response.json();
      setBatches(data.distributions || []);
    } catch (error) {
      console.error('Failed to fetch distributions:', error);
    }
  };

  const processDistribution = async (batchId: string) => {
    setProcessingBatchId(batchId);
    setCurrentProgress(0);

    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;

    for (let i = 0; i < batch.splits.length; i++) {
      const split = batch.splits[i];

      // Update split status to processing
      setBatches(prev => prev.map(b =>
        b.id === batchId
          ? {
              ...b,
              splits: b.splits.map((s, idx) =>
                idx === i ? { ...s, status: 'processing' } : s
              ),
            }
          : b
      ));

      try {
        const response = await fetch('/api/royalties/distribute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            batchId,
            splitId: split.id,
            recipientAddress: split.recipientAddress,
            amount: split.amount,
          }),
        });

        const result = await response.json();

        if (result.success) {
          setBatches(prev => prev.map(b =>
            b.id === batchId
              ? {
                  ...b,
                  splits: b.splits.map((s, idx) =>
                    idx === i ? { ...s, status: 'completed', transactionHash: result.transactionHash } : s
                  ),
                }
              : b
          ));

          toast({
            title: 'Payment Sent',
            description: `${split.recipientName} received $${split.amount}`,
          });
        } else {
          throw new Error(result.error);
        }
      } catch (error: any) {
        setBatches(prev => prev.map(b =>
          b.id === batchId
            ? {
                ...b,
                splits: b.splits.map((s, idx) =>
                  idx === i ? { ...s, status: 'failed' } : s
                ),
              }
            : b
        ));

        toast({
          title: 'Payment Failed',
          description: `Failed to pay ${split.recipientName}: ${error.message}`,
          variant: 'destructive',
        });
      }

      setCurrentProgress(((i + 1) / batch.splits.length) * 100);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Update batch status
    setBatches(prev => prev.map(b =>
      b.id === batchId
        ? {
            ...b,
            status: b.splits.every(s => s.status === 'completed') ? 'completed' : 'partial',
            completedAt: new Date().toISOString(),
          }
        : b
    ));

    setProcessingBatchId(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-600">Completed</Badge>;
      case 'processing':
        return <Badge variant="default">Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'partial':
        return <Badge variant="secondary">Partial</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pending</p>
                <p className="text-2xl font-bold">
                  ${batches.reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recipients</p>
                <p className="text-2xl font-bold">
                  {batches.reduce((sum, b) => sum + b.splits.length, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Batches</p>
                <p className="text-2xl font-bold">{batches.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg per Batch</p>
                <p className="text-2xl font-bold">
                  ${batches.length > 0
                    ? (batches.reduce((sum, b) => sum + b.totalAmount, 0) / batches.length).toFixed(0)
                    : '0'}
                </p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Batches */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Distributions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {batches.map(batch => (
            <div key={batch.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{batch.assetName}</h3>
                  <p className="text-sm text-muted-foreground">{batch.period}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">${batch.totalAmount.toLocaleString()}</p>
                  {getStatusBadge(batch.status)}
                </div>
              </div>

              {processingBatchId === batch.id && (
                <Progress value={currentProgress} className="h-2" />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {batch.splits.map(split => (
                  <div
                    key={split.id}
                    className={`flex items-center justify-between p-2 rounded ${
                      split.status === 'completed' ? 'bg-green-50 dark:bg-green-900/10' :
                      split.status === 'failed' ? 'bg-red-50 dark:bg-red-900/10' :
                      split.status === 'processing' ? 'bg-blue-50 dark:bg-blue-900/10' :
                      'bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {split.status === 'processing' && <Loader2 className="h-3 w-3 animate-spin" />}
                      {split.status === 'completed' && <CheckCircle className="h-3 w-3 text-green-600" />}
                      {split.status === 'failed' && <AlertCircle className="h-3 w-3 text-red-600" />}
                      <div>
                        <p className="text-sm font-medium">{split.recipientName}</p>
                        <p className="text-xs text-muted-foreground">{split.role} ({split.percentage}%)</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium">${split.amount.toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {batch.status === 'pending' && !processingBatchId && (
                <Button
                  onClick={() => processDistribution(batch.id)}
                  className="w-full"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Distribute Royalties via x402
                </Button>
              )}
            </div>
          ))}

          {batches.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No pending distributions</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
