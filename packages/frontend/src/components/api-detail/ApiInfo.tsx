import { formatEther } from "viem";
import type { ApiListingPublic } from "@apimarket/shared";
import StatusBadge from "../shared/StatusBadge";

export default function ApiInfo({ api }: { api: ApiListingPublic }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{api.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            by{" "}
            <span className="font-mono">
              {api.sellerAddress.slice(0, 6)}...{api.sellerAddress.slice(-4)}
            </span>
          </p>
        </div>
        <StatusBadge status={api.status} />
      </div>

      <p className="text-gray-700 mb-6">{api.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Price</p>
          <p className="text-2xl font-bold text-primary-500">
            {formatEther(BigInt(api.price))} MON
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Category</p>
          <p className="text-lg font-medium">{api.category}</p>
        </div>
      </div>

      {api.exampleRequest != null && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Example Request
          </h3>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-auto">
            {JSON.stringify(api.exampleRequest, null, 2)}
          </pre>
        </div>
      )}

      {api.exampleResponse != null && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Example Response
          </h3>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-auto">
            {JSON.stringify(api.exampleResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
