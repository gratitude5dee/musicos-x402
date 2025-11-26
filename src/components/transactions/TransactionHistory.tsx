import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUserTransactions, subscribeToUserTransactions, type Transaction } from '../../utils/supabase';
import { formatTokenAmount } from '../../utils/contracts';

const TransactionHistory: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const loadTransactions = async () => {
      try {
        const txs = await getUserTransactions(user.id);
        setTransactions(txs);
      } catch (error) {
        console.error('Failed to load transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();

    const channel = subscribeToUserTransactions(user.id, (transaction) => {
      setTransactions(prev => {
        const index = prev.findIndex(t => t.id === transaction.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = transaction;
          return updated;
        }
        return [transaction, ...prev];
      });
    });

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'failed':
        return 'Failed';
      default:
        return 'Pending';
    }
  };

  const isIncoming = (tx: Transaction) => tx.to_user_id === user?.id;

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="space-y-3">
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>

      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => {
            const incoming = isIncoming(tx);
            const otherUser = incoming ? tx.from_user : tx.to_user;
            
            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    incoming ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    {incoming ? (
                      <ArrowDownLeft className="h-5 w-5 text-green-600" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-900">
                      {incoming ? 'Received from' : 'Sent to'} @{otherUser?.username || 'Unknown'}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusIcon(tx.status)}
                      <span className="text-xs text-gray-500">
                        {getStatusText(tx.status)}
                      </span>
                      {tx.message && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-gray-500">
                            {tx.message}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`font-semibold ${
                    incoming ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    {incoming ? '+' : '-'}{formatTokenAmount(tx.amount, 6)} {tx.token_symbol}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
