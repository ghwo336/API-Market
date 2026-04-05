import Link from "next/link";
import { formatEther } from "viem";
import type { ApiListingPublic } from "@apimarket/shared";

export default function ApiCard({ api }: { api: ApiListingPublic }) {
  return (
    <Link href={`/apis/${api.id}`}>
      <div className="card hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900">{api.name}</h3>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            {api.category}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {api.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-primary-500">
            {formatEther(BigInt(api.price))} ETH
          </span>
          <span className="text-xs text-gray-400 font-mono">
            {api.sellerAddress.slice(0, 6)}...{api.sellerAddress.slice(-4)}
          </span>
        </div>
      </div>
    </Link>
  );
}
