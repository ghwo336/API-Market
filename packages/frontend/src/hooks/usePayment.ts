"use client";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { apiClient } from "@/lib/api-client";
import { ESCROW_ADDRESS } from "@/config/contracts";
import type { PreparePaymentResponse } from "@apimarket/shared";

const payAbi = [
  {
    inputs: [
      { name: "apiId", type: "uint256" },
      { name: "seller", type: "address" },
    ],
    name: "pay",
    outputs: [{ name: "paymentId", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
] as const;

export function usePayment() {
  const [prepareData, setPrepareData] =
    useState<PreparePaymentResponse | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [prepareError, setPrepareError] = useState<string | null>(null);

  const {
    data: txHash,
    writeContract,
    isPending: isWriting,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: txHash });

  async function prepare(apiId: string, buyer: string) {
    setIsPreparing(true);
    setPrepareError(null);
    try {
      const data = await apiClient.post<PreparePaymentResponse>("/prepare", {
        apiId,
        buyer,
      });
      setPrepareData(data);
      return data;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to prepare payment";
      setPrepareError(msg);
      throw err;
    } finally {
      setIsPreparing(false);
    }
  }

  function pay(onChainApiId: number, seller: string, amountWei: string) {
    writeContract({
      address: ESCROW_ADDRESS,
      abi: payAbi,
      functionName: "pay",
      args: [BigInt(onChainApiId), seller as `0x${string}`],
      value: BigInt(amountWei),
    });
  }

  return {
    prepare,
    pay,
    prepareData,
    isPreparing,
    prepareError,
    txHash,
    isWriting,
    writeError,
    isConfirming,
    isConfirmed,
  };
}
