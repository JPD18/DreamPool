import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ProposedGoal } from '../types';
import { useCreatePool } from '../services/useCreatePool';

export const CreateGoal: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [goal, setGoal] = useState<ProposedGoal | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { address, isConnecting: walletLoading } = useAccount();
  const { createPool, isPending, isConfirming, isConfirmed, error: contractError } = useCreatePool();

  useEffect(() => {
    if (location.state?.goal) {
      setGoal(location.state.goal);
    } else {
      navigate('/chat');
    }
  }, [location.state, navigate]);

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed) {
      // Wait a moment then redirect to view pools to see the new pool
      setTimeout(() => {
        navigate('/pools', {
          state: {
            success: true,
            message: 'Goal created successfully on blockchain!',
          },
        });
      }, 1000);
    }
  }, [isConfirmed, navigate]);

  // Handle contract errors
  useEffect(() => {
    if (contractError) {
      setError(contractError.message);
      setIsCreating(false);
    }
  }, [contractError]);

  const handleCreateGoal = async () => {
    if (!goal) return;

    if (walletLoading) {
      setError('Please wait until wallet connection is done.');
      return;
    }

    if (!address) {
      setError('Please connect your wallet first.');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const recipient =
        goal.recipient === '0x0000000000000000000000000000000000000000'
          ? address
          : goal.recipient;

      await createPool(recipient as `0x${string}`, goal.cost_eth, goal.deadline_days);

      // Refresh pools after successful creation
      setTimeout(() => {
        window.location.reload(); // Simple refresh to show new pool
      }, 2000);

      // The transaction will be handled by wagmi hooks
      // Navigation will happen when transaction is confirmed
    } catch (err) {
      console.error('Failed to create goal:', err);
      setError(err instanceof Error ? err.message : 'Failed to create goal');
      setIsCreating(false);
    }
  };

  const handleGoBack = () => {
    navigate('/chat');
  };

  if (!goal) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-neon border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading goal details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-4">Confirm Your Goal</h1>
          <p className="text-gray-600">
            Review the details and create your funding goal on-chain
          </p>
        </div>

        {/* Goal Summary */}
        <div className="bg-white/70 border border-neon/20 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-black mb-4">{goal.title}</h2>

          {goal.description && (
            <p className="text-gray-700 mb-6">{goal.description}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-neon mb-2">
                {goal.cost_eth} ETH
              </div>
              <div className="text-gray-600">Goal Amount</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-magenta mb-2">
                {goal.deadline_days}
              </div>
              <div className="text-gray-600">Days to Raise</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-black mb-2">
                {goal.recipient ===
                '0x0000000000000000000000000000000000000000'
                  ? 'You'
                  : 'Other'}
              </div>
              <div className="text-gray-600">Recipient</div>
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
            className="flex-1 px-6 py-3 border border-gray-400 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Back to Chat
          </button>
          <button
            onClick={handleCreateGoal}
            disabled={isCreating || isPending || isConfirming}
            className="flex-1 px-6 py-3 bg-neon text-dark font-medium rounded-lg hover:bg-neon/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {(isCreating || isPending) ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-dark border-t-transparent rounded-full animate-spin" />
                <span>Creating Goal...</span>
              </div>
            ) : isConfirming ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-dark border-t-transparent rounded-full animate-spin" />
                <span>Confirming Transaction...</span>
              </div>
            ) : (
              'Create Goal on Blockchain'
            )}
          </button>
        </div>

        {/* Info */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            This will create a smart contract pool that others can contribute to.
            You’ll be able to track progress and manage funds from your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};
