type Variant = "paid" | "partial" | "overdue" | "vacant";
const STATUS_VARIANT: Record<string, Variant> = {
  ALLOCATED: "paid", COMPLETED: "paid", AVAILABLE: "paid", APPLIED: "paid",
  PENDING: "partial",
  FAILED: "overdue", CANCELLED: "overdue", REVERSED: "overdue", REFUNDED: "overdue",
};

export function statusVariant(status: string): Variant {
  const s = status.trim().toUpperCase().replace(/[\s-]+/g, "_");
  return STATUS_VARIANT[s] ?? "vacant";
}

export function StatusBadge({ status }: { status: string }) {
  return <span className={`badge badge-${statusVariant(status)}`}>{status.replace(/_/g, " ")}</span>;
}
