import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import UsernameSetup from '../components/auth/UsernameSetup';
import BalanceDisplay from '../components/payments/BalanceDisplay';
import UserSearch from '../components/users/UserSearch';
import SendPayment, { type PaymentData } from '../components/payments/SendPayment';
import PaymentConfirm from '../components/payments/PaymentConfirm';
import TransactionHistory from '../components/transactions/TransactionHistory';
import { type User } from '../utils/supabase';
import { Home, Send, Clock, Search, User as UserIcon, LogOut, ChevronDown } from 'lucide-react';

type PaymentFlow = 'search' | 'form' | 'confirm';
type Tab = 'home' | 'send' | 'activity' | 'search' | 'profile';

const StablePay: React.FC = () => {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [currentTab, setCurrentTab] = useState<Tab>('home');
  const [paymentFlow, setPaymentFlow] = useState<PaymentFlow>('search');
  const [selectedRecipient, setSelectedRecipient] = useState<User | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  if (!user?.username) {
    return <UsernameSetup />;
  }

  const handleUserSelectForPayment = (selectedUser: User) => {
    setSelectedRecipient(selectedUser);
    setPaymentFlow('form');
  };

  const handlePaymentConfirm = (data: PaymentData) => {
    setPaymentData(data);
    setPaymentFlow('confirm');
  };

  const handlePaymentSuccess = () => {
    setCurrentTab('home');
    setPaymentFlow('search');
    setSelectedRecipient(null);
    setPaymentData(null);
  };

  const handleBackToSearch = () => {
    setPaymentFlow('search');
    setSelectedRecipient(null);
    setPaymentData(null);
  };

  const handleBackToForm = () => {
    setPaymentFlow('form');
    setPaymentData(null);
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 'home':
        return (
          <div className="p-4 space-y-6">
            <BalanceDisplay />
            <TransactionHistory />
          </div>
        );
      
      case 'send':
        if (paymentFlow === 'search') {
          return (
            <div className="p-4 space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Send Payment</h2>
                <UserSearch 
                  showPayButton={true}
                  onUserSelect={handleUserSelectForPayment}
                />
              </div>
            </div>
          );
        } else if (paymentFlow === 'form' && selectedRecipient) {
          return (
            <SendPayment
              recipient={selectedRecipient}
              onBack={handleBackToSearch}
              onPaymentConfirm={handlePaymentConfirm}
            />
          );
        } else if (paymentFlow === 'confirm' && paymentData) {
          return (
            <PaymentConfirm
              paymentData={paymentData}
              onBack={handleBackToForm}
              onSuccess={handlePaymentSuccess}
            />
          );
        }
        return null;
      
      case 'activity':
        return (
          <div className="p-4 space-y-6">
            <TransactionHistory />
          </div>
        );
      
      case 'search':
        return (
          <div className="p-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Find Users</h2>
              <UserSearch 
                onUserSelect={(selectedUser) => {
                  setSelectedRecipient(selectedUser);
                  setCurrentTab('send');
                  setPaymentFlow('form');
                }}
              />
            </div>
          </div>
        );
      
      case 'profile':
        return (
          <div className="p-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {user.display_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {user.display_name || user.username}
                    </h3>
                    <p className="text-gray-500">@{user.username}</p>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Wallet Address</h4>
                  <p className="text-xs font-mono text-gray-600 break-all bg-gray-50 p-3 rounded-lg">
                    {user.wallet_address}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const handleTabChange = (tab: Tab) => {
    setCurrentTab(tab);
    if (tab !== 'send') {
      setPaymentFlow('search');
      setSelectedRecipient(null);
      setPaymentData(null);
    }
  };

  const tabs = [
    { id: 'home' as const, icon: Home, label: 'Home' },
    { id: 'send' as const, icon: Send, label: 'Pay' },
    { id: 'activity' as const, icon: Clock, label: 'Activity' },
    { id: 'search' as const, icon: Search, label: 'Search' },
    { id: 'profile' as const, icon: UserIcon, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">💰</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">StablePay</h1>
          </div>
          
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  {user.display_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-fade-in">
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20">
        {renderTabContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 shadow-lg">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex flex-col items-center justify-center px-2 py-2 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                  isActive
                    ? 'text-blue-500 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-blue-500' : ''}`} />
                <span className={`text-xs mt-1 font-medium truncate ${isActive ? 'text-blue-500' : ''}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default StablePay;
