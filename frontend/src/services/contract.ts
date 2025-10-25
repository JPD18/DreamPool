import { ethers } from 'ethers';
import { PoolData } from '../types';

// Contract ABI for MultiPool
const MULTI_POOL_ABI = [
  {
    "inputs": [
      {"name": "recipient", "type": "address"},
      {"name": "goalAmount", "type": "uint256"},
      {"name": "deadline", "type": "uint256"},
      {"name": "metadata", "type": "string"}
    ],
    "name": "createPool",
    "outputs": [{"name": "poolId", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "poolId", "type": "uint256"}],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"name": "poolId", "type": "uint256"}],
    "name": "getPool",
    "outputs": [
      {"name": "recipient", "type": "address"},
      {"name": "goalAmount", "type": "uint256"},
      {"name": "deadline", "type": "uint256"},
      {"name": "raisedAmount", "type": "uint256"},
      {"name": "status", "type": "uint8"},
      {"name": "metadata", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export class ContractService {
  private static instance: ContractService;
  private provider: ethers.Provider;
  private contract: ethers.Contract;

  private constructor() {
    // Initialize provider (using public RPC for read operations)
    this.provider = new ethers.JsonRpcProvider(
      import.meta.env.VITE_RPC_URL || 'https://sepolia.infura.io/v3/your-key'
    );
    
    // Initialize contract
    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || '0x1234567890123456789012345678901234567890';
    this.contract = new ethers.Contract(contractAddress, MULTI_POOL_ABI, this.provider);
  }

  static getInstance(): ContractService {
    if (!ContractService.instance) {
      ContractService.instance = new ContractService();
    }
    return ContractService.instance;
  }

  async getPool(poolId: number): Promise<PoolData> {
    try {
      const poolData = await this.contract.getPool(poolId);
      
      // Parse metadata
      let metadata;
      try {
        metadata = JSON.parse(poolData.metadata);
      } catch {
        metadata = { title: 'Untitled Goal', description: '' };
      }

      // Determine status
      const now = Math.floor(Date.now() / 1000);
      let status: 'active' | 'completed' | 'expired';
      
      if (poolData.raisedAmount >= poolData.goalAmount) {
        status = 'completed';
      } else if (now > poolData.deadline) {
        status = 'expired';
      } else {
        status = 'active';
      }

      return {
        pool_id: poolId,
        recipient: poolData.recipient,
        goal_amount: Number(poolData.goalAmount),
        deadline: Number(poolData.deadline),
        raised_amount: Number(poolData.raisedAmount),
        status,
        title: metadata.title || 'Untitled Goal',
        description: metadata.description || '',
      };
    } catch (error) {
      console.error('Failed to get pool data:', error);
      throw new Error('Failed to fetch pool information');
    }
  }

  async getPoolCount(): Promise<number> {
    try {
      // This would need to be implemented in the contract
      // For now, return a placeholder
      return 0;
    } catch (error) {
      console.error('Failed to get pool count:', error);
      return 0;
    }
  }

  // Utility methods
  formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString();
  }

  getTimeRemaining(deadline: number): string {
    const now = Math.floor(Date.now() / 1000);
    const remaining = deadline - now;
    
    if (remaining <= 0) return 'Expired';
    
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  }

  calculateProgress(raised: number, goal: number): number {
    if (goal === 0) return 0;
    return Math.min((raised / goal) * 100, 100);
  }
}
