import { ethers } from 'ethers';
import { PoolData } from '../types';

// Contract ABI for DreamPool Contract
const POOL_CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "poolCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }],
    "name": "getPool",
    "outputs": [
      { "internalType": "address", "name": "creator", "type": "address" },
      { "internalType": "address", "name": "recipient", "type": "address" },
      { "internalType": "uint256", "name": "goal", "type": "uint256" },
      { "internalType": "uint256", "name": "totalContrib", "type": "uint256" },
      { "internalType": "uint256", "name": "deadline", "type": "uint256" },
      { "internalType": "bool", "name": "finalized", "type": "bool" },
      { "internalType": "bool", "name": "failed", "type": "bool" }
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
    // Initialize provider (using Base Sepolia RPC for read operations)
    this.provider = new ethers.JsonRpcProvider(
      import.meta.env.VITE_RPC_URL || 'https://sepolia.base.org'
    );

    // Initialize contract with the deployed DreamPool contract address
    const contractAddress = '0x8519F9f785667a7b05B441219832121ce2C636eE';
    this.contract = new ethers.Contract(contractAddress, POOL_CONTRACT_ABI, this.provider);
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

      // Determine status based on finalized and failed flags
      const now = Math.floor(Date.now() / 1000);
      let status: 'active' | 'completed' | 'expired';

      if (poolData.finalized) {
        status = 'completed';
      } else if (poolData.failed) {
        status = 'expired';
      } else if (now > poolData.deadline) {
        status = 'expired';
      } else {
        status = 'active';
      }

      return {
        pool_id: poolId,
        recipient: poolData.recipient,
        creator: poolData.creator,
        goal_amount: Number(poolData.goal), // in wei
        deadline: Number(poolData.deadline),
        raised_amount: Number(poolData.totalContrib), // in wei
        status,
        title: 'DreamPool Goal', // The contract doesn't store metadata, so we'll use a generic title
        description: `Pool created by ${poolData.creator.slice(0, 6)}...${poolData.creator.slice(-4)}`,
        finalized: poolData.finalized,
        failed: poolData.failed,
      };
    } catch (error) {
      console.error('Failed to get pool data:', error);
      throw new Error('Failed to fetch pool information');
    }
  }

  async getPoolCount(): Promise<number> {
    try {
      const count = await this.contract.poolCount();
      return Number(count);
    } catch (error) {
      console.error('Failed to get pool count:', error);
      return 0;
    }
  }

  async getAllPools(): Promise<PoolData[]> {
    try {
      const poolCount = await this.getPoolCount();
      if (poolCount === 0) return [];

      const pools = await Promise.all(
        Array.from({ length: poolCount }, async (_, i) => {
          const poolId = i + 1;
          return await this.getPool(poolId);
        })
      );

      // Sort by pool ID (newest first)
      return pools.sort((a, b) => b.pool_id - a.pool_id);
    } catch (error) {
      console.error('Failed to get all pools:', error);
      throw new Error('Failed to fetch pools');
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
