"use client";

import { useEffect } from "react";
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
        <h1 className="text-3xl font-bold mb-4" style={{ color: "var(--text)" }}>My APIs</h1>
        <p style={{ color: "var(--text2)" }}>
          Connect your wallet to view your registered APIs.
        </p>
      </div>
    );
  }

  const summary = {
    total: apis.length,
    approved: apis.filter((a) => a.status === "APPROVED").length,
    pending:  apis.filter((a) => a.status === "PENDING").length,
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
          <h1 className="text-3xl font-bold" style={{ color: "var(--text)" }}>My APIs</h1>
          <p className="text-sm mt-1 font-mono" style={{ color: "var(--text3)" }}>{address}</p>
        </div>
        <Link href="/register" className="btn-primary px-4 py-2 text-sm">
          + Register New API
        </Link>
      </div>

      {/* Claim earnings */}
      <div
        className="card mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={hasPending ? { borderColor: "rgba(63,185,80,0.4)", background: "rgba(63,185,80,0.05)" } : {}}
      >
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--text2)" }}>Claimable Earnings</p>
          <p
            className="text-2xl font-bold mt-1"
            style={{ color: hasPending ? "var(--green)" : "var(--text3)" }}
          >
            {formatEther(pendingAmount)} ETH
          </p>
          {isConfirmed && (
            <p className="text-xs mt-1" style={{ color: "var(--green)" }}>Successfully claimed!</p>
          )}
        </div>
        <button
          onClick={claim}
          disabled={!hasPending || isPending || isConfirming}
          className="btn-primary px-6 py-2"
        >
          {isPending || isConfirming ? "Claiming..." : "Claim"}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-8">
        <StatCard label="Total APIs"  value={summary.total} />
        <StatCard label="Approved"    value={summary.approved}   color="var(--green)" />
        <StatCard label="Pending"     value={summary.pending}    color="#e3b341" />
        <StatCard label="Rejected"    value={summary.rejected}   color="var(--red)" />
        <StatCard label="Total Sales" value={summary.totalSales} />
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <LoadingSpinner />
        </div>
      )}

      {error && (
        <div className="card text-center py-8" style={{ color: "var(--red)" }}>{error}</div>
      )}

      {!loading && !error && apis.length === 0 && (
        <div className="card text-center py-12">
          <p className="mb-4" style={{ color: "var(--text2)" }}>You haven't registered any APIs yet.</p>
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

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="card text-center py-4">
      <p className="text-2xl font-bold" style={{ color: color ?? "var(--text)" }}>{value}</p>
      <p className="text-xs mt-1" style={{ color: "var(--text2)" }}>{label}</p>
    </div>
  );
}

function ApiRow({ api, onDelete }: { api: SellerApi; onDelete: (id: string) => void }) {
  const priceInEth = formatEther(BigInt(api.price));
  const canDelete = api.status === "APPROVED" || api.status === "REJECTED" || api.status === "REVOKED";

  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <h3 className="font-semibold truncate" style={{ color: "var(--text)" }}>{api.name}</h3>
          <StatusBadge status={api.status} />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {api.status === "APPROVED" && (
            <Link
              href={`/apis/${api.id}`}
              className="text-xs font-medium hover:underline whitespace-nowrap"
              style={{ color: "var(--cyan)" }}
            >
              View →
            </Link>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(api.id)}
              className="text-xs font-medium whitespace-nowrap transition-colors"
              style={{ color: "var(--text3)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--red)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text3)")}
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <p className="text-sm line-clamp-2" style={{ color: "var(--text2)" }}>{api.description}</p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span
          className="text-xs font-medium capitalize px-2 py-0.5 rounded"
          style={{ background: "var(--bg3)", color: "var(--text2)", border: "1px solid var(--border2)" }}
        >
          {api.category}
        </span>
        <span className="text-sm font-semibold" style={{ color: "var(--green)" }}>{priceInEth} ETH</span>
        <span className="text-xs" style={{ color: "var(--text3)" }}>{api._count.payments} sales</span>
        <span className="text-xs" style={{ color: "var(--text3)" }}>
          {new Date(api.createdAt).toLocaleDateString()}
        </span>
        {api.status === "PENDING" && (
          <span className="text-xs font-medium" style={{ color: "#e3b341" }}>Awaiting review</span>
        )}
      </div>

      {api.status === "REJECTED" && (
        <div
          className="rounded px-3 py-2 text-xs"
          style={{ background: "rgba(248,81,73,0.1)", border: "1px solid rgba(248,81,73,0.3)", color: "var(--red)" }}
        >
          <span className="font-medium">거절 이유: </span>
          {api.rejectionReason ?? "이유 없음"}
        </div>
      )}
    </div>
  );
}
