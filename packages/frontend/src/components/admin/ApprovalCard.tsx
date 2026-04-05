"use client";

import { useState } from "react";
import { formatEther } from "viem";
import type { ApiListing } from "@apimarket/shared";
import StatusBadge from "../shared/StatusBadge";

const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/api";

interface TestResult {
  status: number | null;
  body: unknown;
  error: string | null;
  latencyMs: number;
}

interface Props {
  api: ApiListing;
  adminAddress: string;
  onApprove: (id: string, reason?: string) => Promise<void>;
  onReject: (id: string, reason?: string) => Promise<void>;
}

export default function ApprovalCard({ api, adminAddress, onApprove, onReject }: Props) {
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  async function handleApprove() {
    setActionLoading(true);
    try {
      await onApprove(api.id);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!showRejectInput) {
      setShowRejectInput(true);
      return;
    }
    setActionLoading(true);
    try {
      await onReject(api.id, rejectReason || undefined);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleTest() {
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await fetch(`${BASE_URL}/admin/apis/${api.id}/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-address": adminAddress,
        },
        body: JSON.stringify({ payload: api.exampleRequest ?? {} }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch {
      setTestResult({ status: null, body: null, error: "Network error", latencyMs: 0 });
    } finally {
      setTestLoading(false);
    }
  }

  const isOk = testResult?.status !== null && testResult?.status !== undefined && testResult.status >= 200 && testResult.status < 300;

  return (
    <div className="card divide-y divide-gray-100">
      {/* Header */}
      <div className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900">{api.name}</h3>
              <StatusBadge status={api.status} />
            </div>
            <p className="text-xs text-gray-400 font-mono">
              Seller: {api.sellerAddress}
            </p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p className="font-medium">{formatEther(BigInt(api.price))} MON</p>
            <p className="capitalize text-xs">{api.category}</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-3">{api.description}</p>

        {/* Endpoint */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-gray-500">Endpoint:</span>
          <code className="text-xs bg-gray-100 px-2 py-0.5 rounded flex-1 truncate">
            {api.endpoint}
          </code>
        </div>
      </div>

      {/* Example request/response */}
      {(api.exampleRequest || api.exampleResponse) && (
        <div className="py-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-medium text-primary-600 hover:underline"
          >
            {expanded ? "Hide" : "Show"} sample request/response
          </button>
          {expanded && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {api.exampleRequest && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Example Request</p>
                  <pre className="text-xs bg-gray-50 border border-gray-200 rounded p-2 overflow-auto max-h-40">
                    {JSON.stringify(api.exampleRequest as object, null, 2)}
                  </pre>
                </div>
              )}
              {api.exampleResponse && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Example Response</p>
                  <pre className="text-xs bg-gray-50 border border-gray-200 rounded p-2 overflow-auto max-h-40">
                    {JSON.stringify(api.exampleResponse as object, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Test section */}
      <div className="py-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-700">Live Test</p>
          <button
            onClick={handleTest}
            disabled={testLoading}
            className="text-xs px-3 py-1.5 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:opacity-50"
          >
            {testLoading ? "Testing..." : "Run Test"}
          </button>
        </div>

        {testResult && (
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-xs">
              <span
                className={`font-bold px-2 py-0.5 rounded ${
                  isOk ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {testResult.status ?? "ERR"}
              </span>
              <span className="text-gray-400">{testResult.latencyMs}ms</span>
              {testResult.error && (
                <span className="text-red-500">{testResult.error}</span>
              )}
            </div>
            {testResult.body !== null && (
              <pre className="text-xs bg-gray-50 border border-gray-200 rounded p-2 overflow-auto max-h-48">
                {JSON.stringify(testResult.body, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="pt-4 space-y-3">
        {showRejectInput && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Rejection reason (optional)
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="input text-sm min-h-[60px]"
              placeholder="e.g. Endpoint unreachable, invalid response format..."
            />
          </div>
        )}
        <div className="flex gap-3">
          <button
            onClick={handleApprove}
            disabled={actionLoading}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {actionLoading ? "Processing..." : "Approve"}
          </button>
          <button
            onClick={handleReject}
            disabled={actionLoading}
            className="btn-danger flex-1 disabled:opacity-50"
          >
            {showRejectInput ? "Confirm Reject" : "Reject"}
          </button>
          {showRejectInput && (
            <button
              onClick={() => { setShowRejectInput(false); setRejectReason(""); }}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
