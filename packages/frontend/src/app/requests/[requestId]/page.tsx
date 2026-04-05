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
        <p className="text-red-500">{error}</p>
      </div>
    );
  }
  if (!request) return null;

  const currentStepIndex = STEPS.indexOf(request.status);
  const isTerminal = ["COMPLETED", "REFUNDED", "FAILED"].includes(request.status);
  const isStuck = ["PAID", "EXECUTING"].includes(request.status);
  const isBuyer = address && request.buyer.toLowerCase() === address.toLowerCase();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Request Status</h1>
      <p className="text-sm text-gray-400 font-mono mb-8">{requestId}</p>

      {/* Progress Steps */}
      <div className="card mb-6">
        <div className="flex justify-between mb-6">
          {STEPS.map((step, i) => (
            <div key={step} className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2 ${
                  i <= currentStepIndex
                    ? request.status === "REFUNDED" || request.status === "FAILED"
                      ? "bg-red-500 text-white"
                      : "bg-primary-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {i + 1}
              </div>
              <span className="text-xs text-gray-500">{step}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-gray-600">Current:</span>
          <StatusBadge status={request.status} />
        </div>
      </div>

      {/* Details */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">Details</h2>

        {request.api && (
          <div>
            <span className="text-sm text-gray-500">API: </span>
            <span className="font-medium">{request.api.name}</span>
          </div>
        )}

        <div>
          <span className="text-sm text-gray-500">Amount: </span>
          <span className="font-mono">{request.amount} wei</span>
        </div>

        {request.txHash && (
          <div>
            <span className="text-sm text-gray-500">Payment TX: </span>
            <span className="font-mono text-xs break-all">{request.txHash}</span>
          </div>
        )}

        {request.completionTxHash && (
          <div>
            <span className="text-sm text-gray-500">Settlement TX: </span>
            <span className="font-mono text-xs break-all">{request.completionTxHash}</span>
          </div>
        )}

        {request.errorMessage && (
          <div className="bg-red-50 p-4 rounded-lg">
            <span className="text-sm text-red-600 font-medium">Error: </span>
            <span className="text-sm text-red-600">{request.errorMessage}</span>
          </div>
        )}

        {request.result != null && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">API Response</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-auto">
              {JSON.stringify(request.result, null, 2)}
            </pre>
          </div>
        )}

        {!isTerminal && (
          <p className="text-sm text-gray-400 text-center animate-pulse">
            Polling for updates...
          </p>
        )}

        {/* 수동 환불 버튼 */}
        {isStuck && isBuyer && (
          <div className="border-t pt-4 mt-2">
            <p className="text-xs text-gray-500 mb-3">
              결제 후 5분이 지나도 처리가 완료되지 않으면 환불을 요청할 수 있습니다.
            </p>
            {refundError && (
              <p className="text-xs text-red-500 mb-2">{refundError}</p>
            )}
            <button
              onClick={handleRefund}
              disabled={refunding}
              className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {refunding ? "Processing refund..." : "Request Refund"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
