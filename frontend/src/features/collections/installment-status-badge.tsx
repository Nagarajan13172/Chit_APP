import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { InstallmentStatus } from "@/types/collection";

const STYLES: Record<InstallmentStatus, { label: string; className: string }> = {
  PAID: { label: "Paid", className: "bg-emerald-600 text-white" },
  PARTIAL: { label: "Partial", className: "bg-amber-500 text-white" },
  PENDING: { label: "Pending", className: "bg-muted text-muted-foreground" },
  OVERDUE: { label: "Overdue", className: "bg-destructive text-destructive-foreground" },
};

export function InstallmentStatusBadge({ status }: { status: InstallmentStatus }) {
  const { label, className } = STYLES[status];
  return <Badge className={cn("border-transparent font-normal", className)}>{label}</Badge>;
}
