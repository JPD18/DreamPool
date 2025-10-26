import { useCallback } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, POOL_CONTRACT_ABI } from './contract';

export function useCreatePool() {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const createPool = useCallback(async (recipient: `0x${string}`, goalEth: number, deadlineDays: number) => {
    if (!address) throw new Error('Wallet not connected');

    // Convert ETH to wei
    const goalWei = BigInt(Math.floor(goalEth * 1e18));

    // Calculate deadline timestamp
    const deadline = BigInt(Math.floor(Date.now() / 1000) + (deadlineDays * 24 * 60 * 60));

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: POOL_CONTRACT_ABI,
      functionName: 'createPool',
      args: [recipient, goalWei, deadline],
    });
  }, [address, writeContract]);

  return {
    createPool,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}
