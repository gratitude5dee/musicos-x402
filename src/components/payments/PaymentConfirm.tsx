import React, { useState } from 'react';
import { ArrowLeft, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CHAINS } from '../../utils/contracts';
import { type PaymentData } from './SendPayment';
import { useToast } from '@/hooks/use-toast';

interface PaymentConfirmProps {
  paymentData: PaymentData;
  onBack: () => void;
  onSuccess: () => void;
}

type PaymentStatus = 'confirming' | 'sending' | 'success' | 'failed';

const PaymentConfirm: React.FC<PaymentConfirmProps> = ({ paymentData, onBack, onSuccess }) => {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<PaymentStatus>('confirming');
  const [error, setError] = useState('');

  const { recipient, token: selectedToken, amount, message } = paymentData;
  const chainName = CHAINS.find(c => c.id === selectedToken.chainId)?.name || `Chain ${selectedToken.chainId}`;

  const handleConfirm = async () => {
    if (!user?.wallet_address || !token) return;

    setStatus('sending');
    setError('');

    try {
      // Call edge function to execute payment
      const response = await fetch(
        'https://ixkkrousepsiorwlaycp.supabase.co/functions/v1/transfer-tokens',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            fromUserId: user.id,
            toUserId: recipient.id,
            fromAddress: user.wallet_address,
            toAddress: recipient.wallet_address,
            amount: paymentData.amountWei,
            tokenContract: selectedToken.address,
            tokenSymbol: selectedToken.symbol,
            chainId: selectedToken.chainId,
            message: message || undefined,
            thirdwebToken: token,
          }),
        }
      );

      if (response.status === 402) {
        const data = await response.json();
        toast({
          title: 'Insufficient Funds',
          description: 'Please add funds to your wallet to complete this payment.',
          variant: 'destructive',
        });
        setError('Insufficient funds. Please add funds to your wallet.');
        setStatus('failed');
        return;
      }

      if (!response.ok) {
        throw new Error('Payment failed');
      }

      const result = await response.json();
      
      setStatus('success');
      toast({
        title: 'Payment Sent!',
        description: `Successfully sent ${amount} ${selectedToken.symbol} to ${recipient.username}`,
      });

      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (error) {
      console.error('Payment failed:', error);
      setError('Payment failed. Please try again.');
      setStatus('failed');
      toast({
        title: 'Payment Failed',
        description: 'There was an error processing your payment.',
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'confirming':
        return <Send className="h-8 w-8 text-blue-500" />;
      case 'sending':
        return <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-8 w-8 text-red-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'confirming':
        return 'Review your payment details';
      case 'sending':
        return 'Sending your payment...';
      case 'success':
        return 'Payment sent successfully!';
      case 'failed':
        return 'Payment failed';
    }
  };

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      <div className="flex items-center space-x-4">
        {status === 'confirming' && (
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
        )}
        <h1 className="text-xl font-semibold text-gray-900">
          {status === 'confirming' ? 'Confirm Payment' : 'Payment Status'}
        </h1>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 text-center animate-scale-in">
        <div className="flex flex-col items-center space-y-4">
          {getStatusIcon()}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{getStatusMessage()}</h2>
            {status === 'sending' && (
              <p className="text-sm text-gray-500 mt-1">
                This may take a few moments
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">To</span>
            <div className="text-right">
              <p className="font-medium text-gray-900">
                {recipient.display_name || recipient.username}
              </p>
              <p className="text-sm text-gray-500">@{recipient.username}</p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Amount</span>
            <div className="text-right">
              <p className="font-medium text-gray-900">
                {amount} {selectedToken.symbol}
              </p>
              <p className="text-sm text-gray-500">{chainName}</p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Network</span>
            <div className="text-right">
              <p className="font-medium text-gray-900">{chainName}</p>
            </div>
          </div>

          {message && (
            <div className="flex justify-between items-start">
              <span className="text-gray-600">Message</span>
              <p className="font-medium text-gray-900 text-right max-w-48">
                "{message}"
              </p>
            </div>
          )}

          <div className="pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              Network fees are covered by the smart wallet
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 animate-fade-in">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {status === 'confirming' && (
        <button
          onClick={handleConfirm}
          className="w-full bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/30 shadow-lg"
        >
          Confirm & Send
        </button>
      )}

      {status === 'success' && (
        <button
          onClick={onSuccess}
          className="w-full bg-green-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-500/30 shadow-lg"
        >
          Done
        </button>
      )}

      {status === 'failed' && (
        <button
          onClick={onBack}
          className="w-full bg-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-500/30 shadow-lg"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default PaymentConfirm;
