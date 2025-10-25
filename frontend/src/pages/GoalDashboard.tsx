import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoalCard } from '../components/GoalCard';
import { PoolData } from '../types';

export const GoalDashboard: React.FC = () => {
  const [pools, setPools] = useState<PoolData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for success message from navigation
    if (location.state?.success) {
      setSuccessMessage(location.state.message);
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  }, [location.state]);

  useEffect(() => {
    loadPools();
  }, []);

  const loadPools = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // For demo purposes, we'll create some mock data
      // In a real app, you'd fetch from the contract
      const mockPools: PoolData[] = [
        {
          pool_id: 1,
          recipient: '0x1234567890123456789012345678901234567890',
          goal_amount: 1000000000000000000, // 1 ETH in wei
          deadline: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days from now
          raised_amount: 300000000000000000, // 0.3 ETH in wei
          status: 'active',
          title: 'Buy a Rare NFT',
          description: 'Help me fund the purchase of a rare digital art piece'
        },
        {
          pool_id: 2,
          recipient: '0x1234567890123456789012345678901234567890',
          goal_amount: 5000000000000000000, // 5 ETH in wei
          deadline: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days from now
          raised_amount: 5000000000000000000, // 5 ETH in wei
          status: 'completed',
          title: 'New Gaming Setup',
          description: 'High-end gaming computer and peripherals'
        }
      ];
      
      setPools(mockPools);
    } catch (error) {
      console.error('Failed to load pools:', error);
      setError('Failed to load your goals');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContribute = async (poolId: number) => {
    try {
      // Placeholder contribution (demo mode)
      alert(`Contribution to pool ${poolId} - Demo mode (wallet integration coming soon)`);
    } catch (error) {
      console.error('Failed to contribute:', error);
      alert('Failed to contribute to this goal');
    }
  };

  const handleCreateNew = () => {
    navigate('/chat');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-neon border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">
              Your Goals Dashboard
            </h1>
            <p className="text-gray-600">
              Track and manage your funding goals
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className="px-6 py-3 bg-neon text-dark font-medium rounded-lg hover:bg-neon/90 transition-colors"
          >
            Create New Goal
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 text-green-400">✅</div>
              <span className="text-green-400">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 text-red-400">⚠️</div>
              <span className="text-red-400">{error}</span>
            </div>
          </div>
        )}

        {/* Goals Grid */}
        {pools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pools.map((pool) => (
              <GoalCard
                key={pool.pool_id}
                pool={pool}
                onContribute={handleContribute}
                showActions={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-neon/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold text-black mb-2">
              No Goals Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first funding goal to get started
            </p>
            <button
              onClick={handleCreateNew}
              className="px-6 py-3 bg-neon text-dark font-medium rounded-lg hover:bg-neon/90 transition-colors"
            >
              Create Your First Goal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
