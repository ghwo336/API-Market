"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Link from "next/link";
import { formatEther } from "viem";
import StatusBadge from "@/components/shared/StatusBadge";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useSellerApis, type SellerApi } from "@/hooks/useSellerApis";
import { useClaim } from "@/hooks/useClaim";
import { apiClient } from "@/lib/api-client";

export default function SellerPage() {
  const { address, isConnected } = useAccount();
  const { apis, loading, error, refetch } = useSellerApis(address);
  const { pendingAmount, claim, isPending, isConfirming, isConfirmed, refetch: refetchClaim } =
    useClaim(address);

  useEffect(() => {
    if (isConfirmed) refetchClaim();
  }, [isConfirmed, refetchClaim]);

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">My APIs</h1>
        <p className="text-gray-500 mb-6">
          Connect your wallet to view your registered APIs.
        </p>
      </div>
    );
  }

  const summary = {
    total: apis.length,
    approved: apis.filter((a) => a.status === "APPROVED").length,
    pending: apis.filter((a) => a.status === "PENDING").length,
    rejected: apis.filter((a) => a.status === "REJECTED").length,
    totalSales: apis.reduce((sum, a) => sum + a._count.payments, 0),
  };

  const hasPending = pendingAmount > BigInt(0);

  async function handleDelete(apiId: string) {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await apiClient.delete(`/apis/${apiId}`, { sellerAddress: address });
    refetch();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My APIs</h1>
          <p className="text-sm text-gray-400 mt-1 font-mono">{address}</p>
        </div>
        <Link href="/register" className="btn-primary px-4 py-2 text-sm">
          + Register New API
        </Link>
      </div>

      {/* Claim earnings */}
      <div className={`card mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${hasPending ? "border-green-200 bg-green-50" : ""}`}>
        <div>
          <p className="text-sm font-medium text-gray-600">Claimable Earnings</p>
          <p className={`text-2xl font-bold mt-1 ${hasPending ? "text-green-600" : "text-gray-400"}`}>
            {formatEther(pendingAmount)} ETH
          </p>
          {isConfirmed && (
            <p className="text-xs text-green-600 mt-1">Successfully claimed!</p>
          )}
        </div>
        <button
          onClick={claim}
          disabled={!hasPending || isPending || isConfirming}
          className="btn-primary px-6 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending || isConfirming ? "Claiming..." : "Claim"}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-8">
        <StatCard label="Total APIs" value={summary.total} />
        <StatCard label="Approved" value={summary.approved} color="text-green-600" />
        <StatCard label="Pending" value={summary.pending} color="text-yellow-600" />
        <StatCard label="Rejected" value={summary.rejected} color="text-red-500" />
        <StatCard label="Total Sales" value={summary.totalSales} />
      </div>

      {/* API list */}
      {loading && (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      )}

      {error && (
        <div className="card text-center py-8 text-red-500">{error}</div>
      )}

      {!loading && !error && apis.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">You haven't registered any APIs yet.</p>
          <Link href="/register" className="btn-primary px-4 py-2 text-sm">
            Register Your First API
          </Link>
        </div>
      )}

      {!loading && apis.length > 0 && (
        <div className="space-y-4">
          {apis.map((api) => (
            <ApiRow key={api.id} api={api} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color = "text-gray-900",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="card text-center py-4">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function ApiRow({ api, onDelete }: { api: SellerApi; onDelete: (id: string) => void }) {
  const priceInEth = formatEther(BigInt(api.price));
  const canDelete = api.status === "APPROVED" || api.status === "REJECTED" || api.status === "REVOKED";

  return (
    <div className="card flex flex-col gap-3">
      {/* 상단: 이름 + 뱃지 + 액션 */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 truncate">{api.name}</h3>
          <StatusBadge status={api.status} />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {api.status === "APPROVED" && (
            <Link
              href={`/apis/${api.id}`}
              className="text-xs text-primary-600 font-medium hover:underline whitespace-nowrap"
            >
              View →
            </Link>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(api.id)}
              className="text-xs text-red-400 hover:text-red-600 font-medium whitespace-nowrap"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* 설명 */}
      <p className="text-sm text-gray-600 line-clamp-2">{api.description}</p>

      {/* 하단 메타 정보 */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="text-xs font-medium text-gray-700 capitalize bg-gray-100 px-2 py-0.5 rounded">
          {api.category}
        </span>
        <span className="text-sm font-semibold text-gray-800">{priceInEth} ETH</span>
        <span className="text-xs text-gray-500">
          {api._count.payments} sales
        </span>
        <span className="text-xs text-gray-500">
          {new Date(api.createdAt).toLocaleDateString()}
        </span>
        {api.status === "PENDING" && (
          <span className="text-xs text-yellow-600 font-medium">Awaiting review</span>
        )}
      </div>

      {/* 거절 이유 */}
      {api.status === "REJECTED" && (
        <div className="bg-red-50 border border-red-100 rounded px-3 py-2 text-xs text-red-600">
          <span className="font-medium">거절 이유: </span>
          {api.rejectionReason ?? "이유 없음"}
        </div>
      )}
    </div>
  );
}
