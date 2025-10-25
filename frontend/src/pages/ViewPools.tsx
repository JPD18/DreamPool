import { useEffect, useState } from "react";
import { ContractService } from "../services/contract";
import { PoolData } from "../types";

export function ViewPools() {
  const [pools, setPools] = useState<PoolData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
