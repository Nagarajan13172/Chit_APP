import { Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Receipt } from "@/types/payment";
import { PaymentModeBadge } from "./payment-mode-badge";
import { useReceipt } from "./queries";

interface ReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Provide a receipt directly (post-collection) … */
  receipt?: Receipt | null;
  /** … or a payment id to fetch it (from the payments list). */
  paymentId?: number | null;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right tabular-nums">{value}</span>
    </div>
  );
}

export function ReceiptDialog({ open, onOpenChange, receipt: receiptProp, paymentId }: ReceiptDialogProps) {
  const shouldFetch = open && !receiptProp && Boolean(paymentId);
  const { data: fetched, isLoading } = useReceipt(paymentId ?? 0, shouldFetch);
  const receipt = receiptProp ?? fetched ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment receipt</DialogTitle>
        </DialogHeader>

        {!receipt ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Loading…
              </>
            ) : (
              "Receipt unavailable."
            )}
          </div>
        ) : (
          <div className="print-area space-y-3 rounded-md border p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-sm font-semibold">{receipt.receiptNumber}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(receipt.paidAt, "dd MMM yyyy, h:mm a")}
                </p>
              </div>
              <PaymentModeBadge mode={receipt.payment.mode} />
            </div>
            <Separator />
            <Row label="Customer" value={`${receipt.customer.name} · ${receipt.customer.phone}`} />
            <Row label="Plan" value={receipt.plan.name} />
            <Row
              label="Ticket / Month"
              value={`#${receipt.membership.ticketNumber ?? "—"} · Month ${receipt.installment.monthNumber}`}
            />
            <Separator />
            <Row label="Installment due" value={formatCurrency(receipt.installment.dueAmount, 2)} />
            <Row label="Amount" value={formatCurrency(receipt.payment.amount, 2)} />
            <Row label="Late fee" value={formatCurrency(receipt.payment.lateFee, 2)} />
            <div className="flex justify-between text-base font-semibold">
              <span>Total collected</span>
              <span className="tabular-nums">
                {formatCurrency(receipt.payment.totalCollected, 2)}
              </span>
            </div>
            <Row label="Pending after" value={formatCurrency(receipt.installment.pendingAfter, 2)} />
            {receipt.payment.referenceNumber ? (
              <Row label="Reference" value={receipt.payment.referenceNumber} />
            ) : null}
            {receipt.collectedBy ? <Row label="Collected by" value={receipt.collectedBy.name} /> : null}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {receipt ? (
            <Button onClick={() => window.print()}>
              <Printer className="size-4" />
              Print
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
