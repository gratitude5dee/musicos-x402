import React, { useState, useEffect } from 'react';
import { Wallet, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getWalletBalance } from '../../utils/thirdwebAPI';
import { CHAINS, formatTokenAmount, type TokenContract } from '../../utils/contracts';

interface Balance {
  token: TokenContract;
  balance: string;
  formattedBalance: string;
}

const BalanceDisplay: React.FC = () => {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const { user } = useAuth();

  const fetchBalances = async (showSpinner = false) => {
    if (!user?.wallet_address) return;

    if (showSpinner) setIsRefreshing(true);
    else setIsLoading(true);
    setError('');

    try {
      const balancePromises: Promise<Balance>[] = [];

      CHAINS.forEach(chain => {
        chain.tokens.forEach(token => {
          const promise = getWalletBalance(
            user.wallet_address,
            token.chainId,
            token.address
          ).then(response => {
            return {
              token,
              balance: response.result?.value || '0',
              formattedBalance: formatTokenAmount(response.result?.value || '0', token.decimals),
            };
          }).catch(error => {
            console.error(`Failed to fetch ${token.symbol} balance:`, error);
            return {
              token,
              balance: '0',
              formattedBalance: '0',
            };
          });
          
          balancePromises.push(promise);
        });
      });

      const results = await Promise.all(balancePromises);
      const nonZeroBalances = results.filter(b => b.balance !== '0');
      
      setBalances(nonZeroBalances.length > 0 ? nonZeroBalances : results);
    } catch (error) {
      console.error('Failed to fetch balances:', error);
      setError('Failed to load balances');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [user?.wallet_address]);

  const getTotalUSDValue = () => {
    return balances.reduce((total, balance) => {
      if (balance.token.symbol === 'USDC' || balance.token.symbol === 'USDT') {
        return total + parseFloat(balance.formattedBalance || '0');
      }
      return total;
    }, 0).toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-200 rounded w-24"></div>
          <div className="h-8 bg-gray-200 rounded w-8"></div>
        </div>
        <div className="space-y-3">
          <div className="h-8 bg-gray-200 rounded w-32"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Wallet className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-900">Your Balance</h2>
        </div>
        
        <button
          onClick={() => fetchBalances(true)}
          disabled={isRefreshing}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={() => fetchBalances()}
            className="text-red-600 text-sm underline mt-1"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <div className="text-3xl font-bold text-gray-900">
              ${getTotalUSDValue()}
            </div>
            <p className="text-sm text-gray-500">Total USD value</p>
          </div>

          <div className="space-y-3">
            {balances.map((balance) => (
              <div
                key={`${balance.token.chainId}-${balance.token.address}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover-scale"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {balance.token.symbol[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {balance.token.symbol}
                    </p>
                    <p className="text-sm text-gray-500">
                      {balance.token.name}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {balance.formattedBalance}
                  </p>
                  <p className="text-sm text-gray-500">
                    {CHAINS.find(c => c.id === balance.token.chainId)?.name}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {balances.length === 0 && (
            <div className="text-center py-8">
              <Wallet className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No balances to display</p>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Wallet Address</p>
            <p className="text-xs font-mono text-gray-700 break-all">
              {user?.wallet_address}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BalanceDisplay;
