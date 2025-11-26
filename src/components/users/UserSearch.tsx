import React, { useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { searchUsers, type User } from '../../utils/supabase';
import { useAuth } from '../../context/AuthContext';

interface UserSearchProps {
  showPayButton?: boolean;
  onUserSelect: (user: User) => void;
}

const UserSearch: React.FC<UserSearchProps> = ({ showPayButton = false, onUserSelect }) => {
  const { user: currentUser } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = useCallback(async (searchQuery: string) => {
    setQuery(searchQuery);
    
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const users = await searchUsers(searchQuery);
      const filteredUsers = users.filter(u => u.id !== currentUser?.id);
      setResults(filteredUsers);
    } catch (error) {
      console.error('Failed to search users:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.id]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by username..."
          className="w-full pl-10 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
        />
      </div>

      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {!isLoading && results.length > 0 && (
        <div className="space-y-2">
          {results.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                  {user.display_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {user.display_name || user.username}
                  </p>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                </div>
              </div>
              
              {showPayButton && (
                <button
                  onClick={() => onUserSelect(user)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  Pay
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!isLoading && query.length >= 2 && results.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No users found</p>
        </div>
      )}
    </div>
  );
};

export default UserSearch;
