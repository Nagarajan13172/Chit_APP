import { createPortal } from "react-dom";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Receipt } from "@/types/payment";

function Divider() {
  return <div className="my-1.5 border-t border-dashed border-black" />;
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={cn("flex justify-between gap-2", bold && "font-bold")}>
      <span className="shrink-0">{label}</span>
      <span className="break-all text-right tabular-nums">{value}</span>
    </div>
  );
}

/**
 * Print-only 80mm thermal receipt. Rendered into a body-level portal that is
 * hidden on screen and shown (alone) during print via the `.thermal-print`
 * rules in index.css. Used wherever a receipt is printed (staff + portal).
 */
export function ThermalReceipt({ receipt }: { receipt: Receipt }) {
  return createPortal(
    <div className="thermal-print">
      <div
        className="mx-auto font-mono text-[11px] leading-tight text-black"
        style={{ width: "72mm", padding: "4mm 2mm" }}
      >
        <div className="text-center">
          <p className="text-[13px] font-bold tracking-[0.2em]">CHIT MANAGER</p>
          <p className="text-[10px] uppercase tracking-wide">Payment Receipt</p>
        </div>
        <Divider />
        <p className="font-bold">{receipt.receiptNumber}</p>
        <div className="flex justify-between">
          <span>{formatDate(receipt.paidAt, "dd MMM yyyy")}</span>
          <span>{formatDate(receipt.paidAt, "h:mm a")}</span>
        </div>
        <Divider />
        <Row label="Customer" value={receipt.customer.name} />
        <Row label="Phone" value={receipt.customer.phone} />
        <Row label="Plan" value={receipt.plan.name} />
        <Row
          label="Ticket/Month"
          value={`#${receipt.membership.ticketNumber ?? "-"} - M${receipt.installment.monthNumber}`}
        />
        <Divider />
        <Row label="Installment due" value={formatCurrency(receipt.installment.dueAmount, 2)} />
        <Row label="Amount" value={formatCurrency(receipt.payment.amount, 2)} />
        <Row label="Late fee" value={formatCurrency(receipt.payment.lateFee, 2)} />
        <Row label="Mode" value={receipt.payment.mode} />
        <Divider />
        <Row label="TOTAL PAID" value={formatCurrency(receipt.payment.totalCollected, 2)} bold />
        <Row label="Pending after" value={formatCurrency(receipt.installment.pendingAfter, 2)} />
        {receipt.payment.referenceNumber ? (
          <Row label="Ref" value={receipt.payment.referenceNumber} />
        ) : null}
        {receipt.collectedBy ? <Row label="Collected by" value={receipt.collectedBy.name} /> : null}
        <Divider />
        <p className="text-center">*** Thank you! ***</p>
        <p className="mt-1 text-center text-[9px]">This is a computer-generated receipt.</p>
      </div>
    </div>,
    document.body,
  );
}
