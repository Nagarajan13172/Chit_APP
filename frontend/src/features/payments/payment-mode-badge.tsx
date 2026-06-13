import { Badge } from "@/components/ui/badge";
import type { PaymentMode } from "@/types/payment";

const LABELS: Record<PaymentMode, string> = {
  CASH: "Cash",
  UPI: "UPI",
  CHEQUE: "Cheque",
};

export function PaymentModeBadge({ mode }: { mode: PaymentMode }) {
  return (
    <Badge variant="outline" className="font-normal">
      {LABELS[mode]}
    </Badge>
  );
}
