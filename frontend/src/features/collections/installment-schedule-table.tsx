import { Receipt as ReceiptIcon, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";
import type { InstallmentView } from "@/types/collection";
import { InstallmentStatusBadge } from "./installment-status-badge";

interface InstallmentScheduleTableProps {
  installments: InstallmentView[];
  /** Collect against a pending installment. Omit to render read-only. */
  onCollect?: (installment: InstallmentView) => void;
  /** Open the receipt for an already-paid installment's latest payment. */
  onViewReceipt?: (paymentId: number) => void;
}

export function InstallmentScheduleTable({
  installments,
  onCollect,
  onViewReceipt,
}: InstallmentScheduleTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16 text-center">#</TableHead>
            <TableHead>Due date</TableHead>
            <TableHead className="text-right">Due</TableHead>
            <TableHead className="text-right">Paid</TableHead>
            <TableHead className="text-right">Pending</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-28 text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {installments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                No installments.
              </TableCell>
            </TableRow>
          ) : (
            installments.map((inst) => {
              const latestPayment = inst.payments?.at(-1);
              return (
                <TableRow key={inst.id}>
                  <TableCell className="text-center font-medium tabular-nums">
                    {inst.monthNumber}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(inst.dueDate)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(inst.dueAmount, 2)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(inst.paidAmount, 2)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {inst.pending > 0 ? formatCurrency(inst.pending, 2) : "—"}
                  </TableCell>
                  <TableCell>
                    <InstallmentStatusBadge status={inst.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {inst.pending > 0 && onCollect ? (
                      <Button size="sm" onClick={() => onCollect(inst)}>
                        <Wallet className="size-4" />
                        Collect
                      </Button>
                    ) : latestPayment && onViewReceipt ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onViewReceipt(latestPayment.id)}
                      >
                        <ReceiptIcon className="size-4" />
                        Receipt
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
