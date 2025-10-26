import { useCallback } from 'react';
import { parseEther } from 'viem';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, POOL_CONTRACT_ABI } from './contract';

export function useContribute() {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const contribute = useCallback(async (poolId: number, amountEth: string) => {
    if (!address) throw new Error('Wallet not connected');

    const amountWei = parseEther(amountEth);

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: POOL_CONTRACT_ABI,
      functionName: 'deposit',
      args: [BigInt(poolId)],
      value: amountWei,
    });
  }, [address, writeContract]);

  return {
    contribute,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}
