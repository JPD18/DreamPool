import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ProposedGoal } from '../types';

export const CreateGoal: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [goal, setGoal] = useState<ProposedGoal | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get goal from navigation state
    if (location.state?.goal) {
      setGoal(location.state.goal);
    } else {
      // Redirect to chat if no goal provided
      navigate('/chat');
    }
  }, [location.state, navigate]);

  const handleCreateGoal = async () => {
    if (!goal) return;

    setIsCreating(true);
    setError(null);

    try {
      // Simulate transaction creation (placeholder)
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing
      const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64);
      
      // Navigate to dashboard with success message
      navigate('/dashboard', { 
        state: { 
          success: true, 
          txHash: mockTxHash,
          message: 'Goal created successfully! (Demo mode)' 
        } 
      });
    } catch (error) {
      console.error('Failed to create goal:', error);
      setError(error instanceof Error ? error.message : 'Failed to create goal');
    } finally {
      setIsCreating(false);
    }
  };

  const handleGoBack = () => {
    navigate('/chat');
  };

  if (!goal) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-neon border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading goal details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Confirm Your Goal
          </h1>
          <p className="text-gray-400">
            Review the details and create your funding goal on-chain
          </p>
        </div>

        {/* Goal Summary */}
        <div className="bg-dark/50 border border-neon/20 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">
            {goal.title}
          </h2>
          
          {goal.description && (
            <p className="text-gray-300 mb-6">
              {goal.description}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-neon mb-2">
                {goal.cost_eth} ETH
              </div>
              <div className="text-gray-400">Goal Amount</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-magenta mb-2">
                {goal.deadline_days}
              </div>
              <div className="text-gray-400">Days to Raise</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {goal.recipient === '0x0000000000000000000000000000000000000000' 
                  ? 'You' 
                  : 'Other'}
              </div>
              <div className="text-gray-400">Recipient</div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 text-red-400">⚠️</div>
              <span className="text-red-400">{error}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={handleGoBack}
            className="flex-1 px-6 py-3 border border-gray-600 text-gray-400 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Chat
          </button>
          <button
            onClick={handleCreateGoal}
            disabled={isCreating}
            className="flex-1 px-6 py-3 bg-neon text-dark font-medium rounded-lg hover:bg-neon/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isCreating ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-dark border-t-transparent rounded-full animate-spin" />
                <span>Creating Goal...</span>
              </div>
            ) : (
              'Create Goal on Blockchain'
            )}
          </button>
        </div>

        {/* Info */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <p>
            This will create a smart contract pool that others can contribute to.
            You'll be able to track progress and manage funds from your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};
