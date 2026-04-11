"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { useRequestStatus } from "@/hooks/useRequestStatus";
import { apiClient } from "@/lib/api-client";
import StatusBadge from "@/components/shared/StatusBadge";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

const STEPS = ["PENDING", "PAID", "EXECUTING", "COMPLETED"];

export default function RequestStatusPage() {
  const params = useParams();
  const requestId = params.requestId as string;
  const { request, loading, error, refetch } = useRequestStatus(requestId);
  const { address } = useAccount();
  const [refunding, setRefunding] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);

  const handleRefund = async () => {
    if (!address) return;
    setRefunding(true);
    setRefundError(null);
    try {
      await apiClient.post(`/payments/requests/${requestId}/refund`, { buyer: address });
      refetch();
    } catch (err) {
      setRefundError(err instanceof Error ? err.message : "Refund failed");
    } finally {
      setRefunding(false);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><LoadingSpinner /></div>;
  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p style={{ color: "var(--red)" }}>{error}</p>
      </div>
    );
  }
  if (!request) return null;

  const currentStepIndex = STEPS.indexOf(request.status);
  const isTerminal = ["COMPLETED", "REFUNDED", "FAILED"].includes(request.status);
  const isStuck = ["PAID", "EXECUTING"].includes(request.status);
  const isBuyer = address && request.buyer.toLowerCase() === address.toLowerCase();
  const isFailed = request.status === "REFUNDED" || request.status === "FAILED";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text)" }}>Request Status</h1>
      <p className="text-sm font-mono mb-8" style={{ color: "var(--text3)" }}>{requestId}</p>

      {/* Progress Steps */}
      <div className="card mb-6">
        <div className="flex justify-between mb-6">
          {STEPS.map((step, i) => (
            <div key={step} className="flex flex-col items-center flex-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2"
                style={{
                  background: i <= currentStepIndex
                    ? isFailed ? "var(--red)" : "var(--accent)"
                    : "var(--bg3)",
                  color: i <= currentStepIndex ? "#fff" : "var(--text3)",
                  border: i > currentStepIndex ? "1px solid var(--border2)" : "none",
                }}
              >
                {i + 1}
              </div>
              <span className="text-xs" style={{ color: "var(--text2)" }}>{step}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2">
          <span className="text-sm" style={{ color: "var(--text2)" }}>Current:</span>
          <StatusBadge status={request.status} />
        </div>
      </div>

      {/* Details */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>Details</h2>

        {request.api && (
          <div>
            <span className="text-sm" style={{ color: "var(--text2)" }}>API: </span>
            <span className="font-medium" style={{ color: "var(--text)" }}>{request.api.name}</span>
          </div>
        )}

        <div>
          <span className="text-sm" style={{ color: "var(--text2)" }}>Amount: </span>
          <span className="font-mono" style={{ color: "var(--text)" }}>{request.amount} wei</span>
        </div>

        {request.txHash && (
          <div>
            <span className="text-sm" style={{ color: "var(--text2)" }}>Payment TX: </span>
            <span className="font-mono text-xs break-all" style={{ color: "var(--cyan)" }}>{request.txHash}</span>
          </div>
        )}

        {request.completionTxHash && (
          <div>
            <span className="text-sm" style={{ color: "var(--text2)" }}>Settlement TX: </span>
            <span className="font-mono text-xs break-all" style={{ color: "var(--cyan)" }}>{request.completionTxHash}</span>
          </div>
        )}

        {request.errorMessage && (
          <div
            className="p-4 rounded-lg"
            style={{ background: "rgba(248,81,73,0.1)", border: "1px solid rgba(248,81,73,0.3)" }}
          >
            <span className="text-sm font-medium" style={{ color: "var(--red)" }}>Error: </span>
            <span className="text-sm" style={{ color: "var(--red)" }}>{request.errorMessage}</span>
          </div>
        )}

        {request.result != null && (
          <div>
            <h3 className="text-sm font-medium mb-2" style={{ color: "var(--text2)" }}>API Response</h3>
            <pre
              className="p-4 rounded-lg text-sm overflow-auto"
              style={{ background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)" }}
            >
              {JSON.stringify(request.result, null, 2)}
            </pre>
          </div>
        )}

        {!isTerminal && (
          <p className="text-sm text-center animate-pulse" style={{ color: "var(--text3)" }}>
            Polling for updates...
          </p>
        )}

        {isStuck && isBuyer && (
          <div className="pt-4 mt-2" style={{ borderTop: "1px solid var(--border)" }}>
            <p className="text-xs mb-3" style={{ color: "var(--text2)" }}>
              결제 후 5분이 지나도 처리가 완료되지 않으면 환불을 요청할 수 있습니다.
            </p>
            {refundError && (
              <p className="text-xs mb-2" style={{ color: "var(--red)" }}>{refundError}</p>
            )}
            <button
              onClick={handleRefund}
              disabled={refunding}
              className="w-full py-2 px-4 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "var(--red)" }}
            >
              {refunding ? "Processing refund..." : "Request Refund"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
