const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  REVOKED: "bg-gray-100 text-gray-800",
  PAID: "bg-blue-100 text-blue-800",
  EXECUTING: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-800",
  REFUNDED: "bg-orange-100 text-orange-800",
  FAILED: "bg-red-100 text-red-800",
};

export default function StatusBadge({ status }: { status: string }) {
  const color = statusColors[status] || "bg-gray-100 text-gray-800";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}
    >
      {status}
    </span>
  );
}
