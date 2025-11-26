import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Send, MessageCircle, DollarSign } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { type User } from '../../utils/supabase';
import { CHAINS, type TokenContract, parseTokenAmount, formatTokenAmount, DEFAULT_CHAIN_ID } from '../../utils/contracts';
import { getWalletBalance } from '../../utils/thirdwebAPI';
import TokenChainSelector from '../ui/TokenChainSelector';

const QUICK_AMOUNTS = ['1', '5', '10', '20', '50'];

interface SendPaymentProps {
  recipient: User;
  onBack: () => void;
  onPaymentConfirm: (paymentData: PaymentData) => void;
}

export interface PaymentData {
  recipient: User;
  token: TokenContract;
  amount: string;
  amountWei: string;
  message: string;
}

const SendPayment: React.FC<SendPaymentProps> = ({ recipient, onBack, onPaymentConfirm }) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [selectedChainId, setSelectedChainId] = useState<number>(DEFAULT_CHAIN_ID);
  const [selectedToken, setSelectedToken] = useState<TokenContract | null>(null);
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [isLoadingBalances, setIsLoadingBalances] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBalances = async () => {
      if (!user?.wallet_address) return;

      setIsLoadingBalances(true);
      const balanceMap: Record<string, string> = {};

      try {
        const selectedChain = CHAINS.find(c => c.id === selectedChainId);
        if (selectedChain) {
          for (const token of selectedChain.tokens) {
            try {
              const balanceResponse = await getWalletBalance(
                user.wallet_address,
                token.chainId,
                token.address
              );
              balanceMap[token.address] = balanceResponse.result?.value || '0';
            } catch (error) {
              console.error(`Failed to fetch balance for ${token.symbol}:`, error);
              balanceMap[token.address] = '0';
            }
          }
        }

        setBalances(balanceMap);
        
        if (selectedChain?.tokens[0]) {
          setSelectedToken(selectedChain.tokens[0]);
        }
      } catch (error) {
        console.error('Failed to load balances:', error);
        setError('Failed to load balances');
      } finally {
        setIsLoadingBalances(false);
      }
    };

    loadBalances();
  }, [user?.wallet_address, selectedChainId]);

  const handleAmountChange = useCallback((value: string) => {
    const regex = /^\d*\.?\d*$/;
    if (regex.test(value)) {
      setAmount(value);
      setError('');
    }
  }, []);

  const validateAmount = useCallback((): boolean => {
    if (!selectedToken || !amount) {
      setError('');
      return false;
    }

    const amountFloat = parseFloat(amount);
    if (isNaN(amountFloat) || amountFloat <= 0) {
      setError('Please enter a valid amount');
      return false;
    }

    setError('');
    return true;
  }, [selectedToken, amount]);

  const handleContinue = useCallback(() => {
    if (!selectedToken || !validateAmount()) return;

    try {
      const amountWei = parseTokenAmount(amount, selectedToken.decimals);
      
      const paymentData: PaymentData = {
        recipient,
        token: selectedToken,
        amount,
        amountWei,
        message: message.trim(),
      };

      onPaymentConfirm(paymentData);
    } catch (error) {
      console.error('Error in handleContinue:', error);
      setError('Invalid amount format');
    }
  }, [selectedToken, validateAmount, amount, message, recipient, onPaymentConfirm]);

  const handleQuickAmountClick = useCallback((quickAmount: string) => {
    setAmount(quickAmount);
    setError('');
  }, []);

  if (isLoadingBalances) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Send Payment</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
            {recipient.display_name?.[0]?.toUpperCase() || recipient.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {recipient.display_name || recipient.username}
            </p>
            <p className="text-sm text-gray-500">@{recipient.username}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Network & Currency
          </label>
          <TokenChainSelector
            selectedChainId={selectedChainId}
            selectedTokenAddress={selectedToken?.address || null}
            onChainSelect={setSelectedChainId}
            onTokenSelect={setSelectedToken}
            balances={balances}
            showBalances={true}
          />
          
          {selectedToken && (
            <div className="mt-2 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Balance:</span> {formatTokenAmount(balances[selectedToken.address] || '0', selectedToken.decimals)} {selectedToken.symbol}
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              className="w-full pl-10 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-2xl font-semibold text-center"
            />
          </div>

          <div className="mt-3 flex space-x-2">
            {QUICK_AMOUNTS.map((quickAmount) => (
              <button
                key={quickAmount}
                onClick={() => handleQuickAmountClick(quickAmount)}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
              >
                ${quickAmount}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message (optional)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MessageCircle className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What's this for?"
              className="w-full pl-10 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
              maxLength={100}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {message.length}/100 characters
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 animate-fade-in">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleContinue}
          disabled={!selectedToken || !amount || !validateAmount()}
          className="w-full bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center"
        >
          <Send className="h-4 w-4 mr-2" />
          Continue
        </button>
      </div>
    </div>
  );
};

export default SendPayment;
