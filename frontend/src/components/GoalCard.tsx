import React from 'react';
import { PoolData } from '../types';

interface GoalCardProps {
  pool: PoolData;
  onContribute?: (poolId: number) => void;
  showActions?: boolean;
}

export const GoalCard: React.FC<GoalCardProps> = ({ 
  pool, 
  onContribute, 
  showActions = true 
}) => {
  // Placeholder utility functions
  const formatEth = (wei: number): string => {
    const eth = wei / 1e18;
    return eth.toFixed(4);
  };

  const calculateProgress = (raised: number, goal: number): number => {
    if (goal === 0) return 0;
    return Math.min((raised / goal) * 100, 100);
  };

  const getTimeRemaining = (deadline: number): string => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = deadline - now;
    
    if (remaining <= 0) return 'Expired';
    
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString();
  };
  
  const progress = calculateProgress(pool.raised_amount, pool.goal_amount);
  const timeRemaining = getTimeRemaining(pool.deadline);
  const goalEth = formatEth(pool.goal_amount);
  const raisedEth = formatEth(pool.raised_amount);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-400/20';
      case 'expired':
        return 'text-red-400 bg-red-400/20';
      default:
        return 'text-neon bg-neon/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'expired':
        return 'Expired';
      default:
        return 'Active';
    }
  };

  return (
    <div className="bg-white/70 border border-neon/20 rounded-lg p-6 hover:border-neon/40 transition-colors">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-black">
          {pool.title}
        </h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(pool.status)}`}>
          {getStatusText(pool.status)}
        </span>
      </div>

      {/* Description */}
      {pool.description && (
        <p className="text-gray-700 mb-4 line-clamp-2">
          {pool.description}
        </p>
      )}

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{raisedEth} ETH raised</span>
          <span>{goalEth} ETH goal</span>
        </div>
        <div className="w-full bg-gray-300 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-neon to-magenta h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-right text-sm text-gray-600 mt-1">
          {progress.toFixed(1)}% funded
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-600">Deadline:</span>
          <div className="text-black font-medium">
            {formatTimestamp(pool.deadline)}
          </div>
        </div>
        <div>
          <span className="text-gray-600">Time Left:</span>
          <div className="text-black font-medium">
            {timeRemaining}
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && pool.status === 'active' && onContribute && (
        <div className="flex gap-3">
          <button
            onClick={() => onContribute(pool.pool_id)}
            className="flex-1 px-4 py-2 bg-neon text-dark font-medium rounded-lg hover:bg-neon/90 transition-colors"
          >
            Contribute
          </button>
          <button className="px-4 py-2 border border-neon/30 text-neon rounded-lg hover:bg-neon/10 transition-colors">
            Share
          </button>
        </div>
      )}

      {/* Completed/Expired Actions */}
      {showActions && pool.status !== 'active' && (
        <div className="flex gap-3">
          <button className="flex-1 px-4 py-2 border border-gray-400 text-gray-600 rounded-lg cursor-not-allowed">
            {pool.status === 'completed' ? 'Goal Achieved' : 'Goal Expired'}
          </button>
          <button className="px-4 py-2 border border-neon/30 text-neon rounded-lg hover:bg-neon/10 transition-colors">
            View Details
          </button>
        </div>
      )}
    </div>
  );
};
