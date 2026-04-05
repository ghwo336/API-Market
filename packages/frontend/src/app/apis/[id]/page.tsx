"use client";

import { useParams } from "next/navigation";
import { useApiDetail } from "@/hooks/useApiDetail";
import ApiInfo from "@/components/api-detail/ApiInfo";
import PurchaseButton from "@/components/api-detail/PurchaseButton";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function ApiDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { api, loading, error, isMock } = useApiDetail(id);

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }
  if (!api) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {isMock && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
          Showing demo data — backend is not connected
        </div>
      )}
      <ApiInfo api={api} />
      <div className="mt-6">
        <PurchaseButton api={api} />
      </div>
    </div>
  );
}
