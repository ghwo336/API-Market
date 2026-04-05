"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";

export interface SellerApi {
  id: string;
  onChainId: number | null;
  name: string;
  description: string;
  price: string;
  category: string;
  sellerAddress: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "REVOKED";
  createdAt: string;
  updatedAt: string;
  _count: { payments: number };
  rejectionReason: string | null;
}

export function useSellerApis(address: string | undefined) {
  const [apis, setApis] = useState<SellerApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    setError(null);
    apiClient
      .get<SellerApi[]>(`/apis/seller/${address}`)
      .then(setApis)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load APIs")
      )
      .finally(() => setLoading(false));
  }, [address, tick]);

  const refetch = () => setTick((t) => t + 1);

  return { apis, loading, error, refetch };
}
