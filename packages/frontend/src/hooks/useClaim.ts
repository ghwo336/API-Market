"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { escrowConfig } from "@/config/contracts";

const claimAbi = [
  {
    inputs: [],
    name: "claim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "", type: "address" }],
    name: "pendingWithdrawals",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export function useClaim(address: `0x${string}` | undefined) {
  const { data: pendingAmount, refetch } = useReadContract({
    address: escrowConfig.address,
    abi: claimAbi,
    functionName: "pendingWithdrawals",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: txHash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash,
      query: {
        enabled: !!txHash,
        // refetch pending amount after confirmation
        gcTime: 0,
      },
    });

  function claim() {
    writeContract({
      address: escrowConfig.address,
      abi: claimAbi,
      functionName: "claim",
    });
  }

  return {
    pendingAmount: pendingAmount ?? BigInt(0),
    claim,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    refetch,
  };
}
