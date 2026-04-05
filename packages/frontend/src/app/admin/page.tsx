"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatEther } from "viem";
import { useAdmin } from "@/hooks/useAdmin";
import { apiClient } from "@/lib/api-client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useAdminAllApis } from "@/hooks/useAdminAllApis";
import ApprovalCard from "@/components/admin/ApprovalCard";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import StatusBadge from "@/components/shared/StatusBadge";

const ADMIN_ADDRESSES = (process.env.NEXT_PUBLIC_ADMIN_ADDRESSES || "")
  .split(",")
  .map((a) => a.trim().toLowerCase())
  .filter(Boolean);

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const { isAuthenticated, signIn, signOut, loading: authLoading, error: authError } = useAdminAuth();
  const { pendingApis, loading, error, approve, reject } = useAdmin();
  const { apis: allApis, loading: allLoading, refetch: refetchAll } = useAdminAllApis(isAuthenticated);
  const [tab, setTab] = useState<"pending" | "all">("pending");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isAdminWallet = isConnected && address && ADMIN_ADDRESSES.includes(address.toLowerCase());

  if (!isConnected) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
        <p className="text-gray-500 mb-6">Connect your admin wallet to continue.</p>
        <div className="flex justify-center">
          <ConnectButton />
        </div>
      </div>
    );
  }

  if (!isAdminWallet) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500 mb-1">This wallet is not authorized.</p>
        <p className="text-sm font-mono text-gray-400 mt-2">{address}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-500 mb-6">
          Sign the message with your wallet to verify ownership.
        </p>
        {authError && (
          <p className="text-sm text-red-500 mb-4">{authError}</p>
        )}
        <button
          onClick={signIn}
          disabled={authLoading}
          className="btn-primary px-6 py-3 disabled:opacity-50"
        >
          {authLoading ? "Waiting for signature..." : "Sign in with Wallet"}
        </button>
        <p className="text-xs text-gray-400 mt-4 font-mono">{address}</p>
      </div>
    );
  }

  async function handleApprove(apiId: string, reason?: string) {
    await approve(apiId, address!, reason);
  }

  async function handleReject(apiId: string, reason?: string) {
    await reject(apiId, address!, reason);
  }

  async function handleAdminDelete(apiId: string) {
    if (!confirm("Delete this API? This cannot be undone.")) return;
    setDeletingId(apiId);
    try {
      await apiClient.delete(`/admin/apis/${apiId}`);
      refetchAll();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Admin Dashboard</h1>
        </div>
        <button onClick={signOut} className="text-sm text-gray-400 hover:text-gray-600">
          Sign out
        </button>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        <button
          onClick={() => setTab("pending")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "pending"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Pending Review
          {pendingApis.length > 0 && (
            <span className="ml-2 bg-yellow-100 text-yellow-700 text-xs px-1.5 py-0.5 rounded-full">
              {pendingApis.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("all")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "all"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          All APIs
          {allApis.length > 0 && (
            <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">
              {allApis.length}
            </span>
          )}
        </button>
      </div>

      {/* Pending 탭 */}
      {tab === "pending" && (
        <>
          {loading && <LoadingSpinner />}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && pendingApis.length === 0 && (
            <div className="card text-center py-8 text-gray-500">
              No pending APIs to review
            </div>
          )}
          <div className="space-y-4">
            {pendingApis.map((api) => (
              <ApprovalCard
                key={api.id}
                api={api}
                adminAddress={address!}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        </>
      )}

      {/* All APIs 탭 */}
      {tab === "all" && (
        <>
          {allLoading && <LoadingSpinner />}
          {!allLoading && (
            <div className="card overflow-hidden p-0">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Price</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Calls</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Seller</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allApis.map((api) => (
                    <tr key={api.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{api.name}</td>
                      <td className="px-4 py-3 text-gray-500 capitalize">{api.category}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={api.status} />
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {formatEther(BigInt(api.price))} MON
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {api._count.payments}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-400 truncate max-w-[160px]">
                        {api.sellerAddress}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleAdminDelete(api.id)}
                          disabled={deletingId === api.id}
                          className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40"
                        >
                          {deletingId === api.id ? "..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {allApis.length === 0 && (
                <p className="text-center py-8 text-gray-500">No APIs registered yet.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
