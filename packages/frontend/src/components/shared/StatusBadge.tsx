const statusStyles: Record<string, { bg: string; color: string }> = {
  PENDING:   { bg: "rgba(210,153,34,0.15)",  color: "#e3b341" },
  APPROVED:  { bg: "rgba(63,185,80,0.15)",   color: "#3fb950" },
  REJECTED:  { bg: "rgba(248,81,73,0.15)",   color: "#f85149" },
  REVOKED:   { bg: "rgba(139,148,158,0.15)", color: "#8b949e" },
  PAID:      { bg: "rgba(121,192,255,0.15)", color: "#79c0ff" },
  EXECUTING: { bg: "rgba(188,140,255,0.15)", color: "#bc8cff" },
  COMPLETED: { bg: "rgba(63,185,80,0.15)",   color: "#3fb950" },
  REFUNDED:  { bg: "rgba(255,166,87,0.15)",  color: "#ffa657" },
  FAILED:    { bg: "rgba(248,81,73,0.15)",   color: "#f85149" },
};

export default function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] ?? { bg: "rgba(139,148,158,0.15)", color: "#8b949e" };

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ background: style.bg, color: style.color }}
    >
      {status}
    </span>
  );
}
