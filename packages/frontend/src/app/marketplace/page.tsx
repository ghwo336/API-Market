"use client";

import { useState } from "react";
import { useApiList } from "@/hooks/useApiList";
import ApiGrid from "@/components/marketplace/ApiGrid";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const { apis, loading, error, isMock } = useApiList({
    search: search || undefined,
    category: category || undefined,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          API Marketplace
        </h1>
        <p className="text-gray-600">
          Browse and purchase verified APIs with on-chain payments
        </p>
      </div>

      <div className="flex gap-4 mb-8">
        <input
          type="text"
          placeholder="Search APIs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input max-w-md"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input max-w-[200px]"
        >
          <option value="">All Categories</option>
          <option value="ai">AI / ML</option>
          <option value="data">Data</option>
          <option value="finance">Finance</option>
          <option value="social">Social</option>
          <option value="utility">Utility</option>
          <option value="general">General</option>
        </select>
      </div>

      {isMock && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
          Showing demo data — backend is not connected
        </div>
      )}

      {loading && <LoadingSpinner />}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && <ApiGrid apis={apis} />}
    </div>
  );
}
