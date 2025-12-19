import { X402Service } from '../x402/x402Service';

export interface RoyaltySplit {
  recipientAddress: string;
  recipientName: string;
  percentage: number;
  role: 'artist' | 'producer' | 'label' | 'publisher' | 'writer';
}

export interface RoyaltyDistribution {
  id: string;
  assetId: string;
  totalAmount: number;
  currency: string;
  splits: RoyaltySplit[];
  period: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transactionHashes: { recipient: string; hash: string }[];
}

export class RoyaltyDistributionService {
  private x402Service: X402Service;

  constructor(x402Service: X402Service) {
    this.x402Service = x402Service;
  }

  async distributeRoyalties(distribution: RoyaltyDistribution): Promise<{
    success: boolean;
    transactions: { recipient: string; hash: string; amount: number }[];
    errors: { recipient: string; error: string }[];
  }> {
    const transactions: { recipient: string; hash: string; amount: number }[] = [];
    const errors: { recipient: string; error: string }[] = [];

    for (const split of distribution.splits) {
      const amount = (distribution.totalAmount * split.percentage) / 100;

      try {
        // Use x402 for each split payment
        const result = await this.executeRoyaltyPayment({
          recipientAddress: split.recipientAddress,
          amount,
          currency: distribution.currency,
          description: `Royalty payment for ${distribution.period} - ${split.role}`,
          assetId: distribution.assetId,
        });

        if (result.success) {
          transactions.push({
            recipient: split.recipientAddress,
            hash: result.transactionHash!,
            amount,
          });
        } else {
          errors.push({
            recipient: split.recipientAddress,
            error: result.error || 'Payment failed',
          });
        }
      } catch (error: any) {
        errors.push({
          recipient: split.recipientAddress,
          error: error.message,
        });
      }
    }

    return {
      success: errors.length === 0,
      transactions,
      errors,
    };
  }

  private async executeRoyaltyPayment(params: {
    recipientAddress: string;
    amount: number;
    currency: string;
    description: string;
    assetId: string;
  }): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    try {
      const result = await this.x402Service.settlePayment({
        resourceUrl: `/api/royalties/pay/${params.assetId}`,
        method: 'POST',
        paymentData: null,
        payTo: params.recipientAddress as `0x${string}`,
        price: `${params.amount}`, // Note: settlePayment expects string
        description: params.description,
      });

      if (result.status === 200) {
        return {
          success: true,
          transactionHash: result.paymentReceipt?.transaction,
        };
      }

      return {
        success: false,
        error: 'Payment settlement failed',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
