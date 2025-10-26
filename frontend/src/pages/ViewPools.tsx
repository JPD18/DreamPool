import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ContractService } from "../services/contract";
import { useContribute } from "../services/useContribute";
import { PoolData } from "../types";

export function ViewPools() {
  const [pools, setPools] = useState<PoolData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contributionAmounts, setContributionAmounts] = useState<Record<number, string>>({});
  const [contributionErrors, setContributionErrors] = useState<Record<number, string>>({});
  const { address } = useAccount();
  const { contribute, isPending: isContributing, isConfirming: isConfirmingContribution, error: contributionError } = useContribute();

  async function loadPools() {
    setLoading(true);
    setError(null);
    try {
      const contractService = ContractService.getInstance();
      const allPools = await contractService.getAllPools();
      setPools(allPools);
    } catch (err) {
      console.error("loadPools error:", err);
      setError(err instanceof Error ? err.message : "Failed to load pools");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPools();
  }, []);

  // Handle successful contribution confirmation
  useEffect(() => {
    if (isConfirmingContribution === false && contributionError === null) {
      // Clear all contribution errors on successful contribution
      setContributionErrors({});
    }
  }, [isConfirmingContribution, contributionError]);

  const formatAddress = (address: string): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatEther = (weiValue: number): string => {
    // Simple conversion for display (in a real app you'd use ethers.js formatEther)
    const eth = weiValue / 1e18;
    return eth.toFixed(4);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'expired':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  const getStatusText = (pool: PoolData) => {
    if (pool.finalized) return 'Finalized';
    if (pool.failed) return 'Failed';
    return pool.status.charAt(0).toUpperCase() + pool.status.slice(1);
  };

  const handleContributionAmountChange = (poolId: number, amount: string) => {
    setContributionAmounts(prev => ({
      ...prev,
      [poolId]: amount
    }));

    // Clear error when user starts typing
    if (contributionErrors[poolId]) {
      setContributionErrors(prev => ({
        ...prev,
        [poolId]: ''
      }));
    }
  };

  const handleContribute = async (poolId: number) => {
    const amount = contributionAmounts[poolId];

    if (!amount || parseFloat(amount) <= 0) {
      setContributionErrors(prev => ({
        ...prev,
        [poolId]: 'Please enter a valid contribution amount'
      }));
      return;
    }

    if (!address) {
      setContributionErrors(prev => ({
        ...prev,
        [poolId]: 'Please connect your wallet first'
      }));
      return;
    }

    try {
      await contribute(poolId, amount);

      // Clear the contribution amount after successful transaction
      setContributionAmounts(prev => ({
        ...prev,
        [poolId]: ''
      }));

      // Refresh pools to show updated amounts
      await loadPools();
    } catch (err) {
      console.error('Contribution failed:', err);
      setContributionErrors(prev => ({
        ...prev,
        [poolId]: err instanceof Error ? err.message : 'Contribution failed'
      }));
    }
  };

  const canContribute = (pool: PoolData) => {
    return pool.status === 'active' && !pool.finalized && !pool.failed;
  };

  return (
    <div className="min-h-screen bg-light">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Active Pools</h1>
            <button
              onClick={loadPools}
              disabled={loading}
              className="px-4 py-2 bg-neon/20 text-neon border border-neon/30 rounded-md hover:bg-neon/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {pools.length === 0 && !loading && !error && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No pools created yet.</div>
              <p className="text-gray-400 mt-2">Be the first to create a DreamPool!</p>
            </div>
          )}

          <div className="space-y-4">
            {pools.map((pool) => (
              <div
                key={pool.pool_id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Pool #{pool.pool_id}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">{pool.title}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(pool.status)}`}>
                      {getStatusText(pool)}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      Deadline: {new Date(pool.deadline * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Creator</p>
                    <p className="font-mono text-sm text-gray-700">{formatAddress(pool.creator)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Recipient</p>
                    <p className="font-mono text-sm text-gray-700">{formatAddress(pool.recipient)}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm text-gray-500">
                      {formatEther(pool.raised_amount)} / {formatEther(pool.goal_amount)} ETH
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-neon h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min((pool.raised_amount / pool.goal_amount) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      {Math.round((pool.raised_amount / pool.goal_amount) * 100)}% funded
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatEther(pool.goal_amount - pool.raised_amount)} ETH remaining
                    </span>
                  </div>
                </div>

                {/* Contribution Section */}
                {canContribute(pool) && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <label htmlFor={`contribute-${pool.pool_id}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Contribute ETH
                        </label>
                        <input
                          type="number"
                          id={`contribute-${pool.pool_id}`}
                          value={contributionAmounts[pool.pool_id] || ''}
                          onChange={(e) => handleContributionAmountChange(pool.pool_id, e.target.value)}
                          placeholder="0.0"
                          step="0.01"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-neon focus:border-neon text-sm"
                        />
                      </div>
                      <div className="pt-6">
                        <button
                          onClick={() => handleContribute(pool.pool_id)}
                          disabled={isContributing || isConfirmingContribution || !contributionAmounts[pool.pool_id]}
                          className="px-4 py-2 bg-neon text-dark font-medium rounded-md hover:bg-neon/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {(isContributing || isConfirmingContribution) ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-dark border-t-transparent rounded-full animate-spin" />
                              <span>Contributing...</span>
                            </div>
                          ) : (
                            'Contribute'
                          )}
                        </button>
                      </div>
                    </div>
                    {contributionErrors[pool.pool_id] && (
                      <p className="mt-2 text-sm text-red-600">{contributionErrors[pool.pool_id]}</p>
                    )}
                    {contributionError && (
                      <p className="mt-2 text-sm text-red-600">{contributionError.message}</p>
                    )}
                  </div>
                )}

                {/* Show contribution disabled message for inactive pools */}
                {!canContribute(pool) && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-sm text-gray-500">
                          {pool.finalized ? 'Pool finalized - contributions closed' :
                           pool.failed ? 'Pool failed - contributions closed' :
                           'Pool expired - contributions closed'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {pool.description && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600">{pool.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {pools.length > 0 && (
            <div className="mt-6 text-center text-sm text-gray-500">
              Showing {pools.length} pool{pools.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
