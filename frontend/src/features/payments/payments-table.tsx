import { Receipt as ReceiptIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";
import type { PaymentListItem } from "@/types/payment";
import { PaymentModeBadge } from "./payment-mode-badge";

interface PaymentsTableProps {
  payments: PaymentListItem[];
  isLoading: boolean;
  isError: boolean;
  onViewReceipt: (paymentId: number) => void;
  rowCount?: number;
}

const COLUMN_COUNT = 9;

export function PaymentsTable({
  payments,
  isLoading,
  isError,
  onViewReceipt,
  rowCount = 10,
}: PaymentsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Receipt</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead className="text-center">Month</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Mode</TableHead>
            <TableHead>By</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isError ? (
            <TableRow>
              <TableCell colSpan={COLUMN_COUNT} className="h-32 text-center text-sm text-destructive">
                Failed to load payments. Please retry.
              </TableCell>
            </TableRow>
          ) : isLoading ? (
            Array.from({ length: rowCount }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: COLUMN_COUNT }).map((__, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={COLUMN_COUNT} className="h-32 text-center text-sm text-muted-foreground">
                No payments found.
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-mono text-xs">{payment.receiptNumber}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(payment.paidAt)}
                </TableCell>
                <TableCell>
                  <Link
                    to={`/customers/${payment.customer.id}`}
                    className="font-medium hover:underline"
                  >
                    {payment.customer.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{payment.plan.name}</TableCell>
                <TableCell className="text-center tabular-nums">{payment.monthNumber}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(payment.totalCollected, 2)}
                </TableCell>
                <TableCell>
                  <PaymentModeBadge mode={payment.mode} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {payment.collectedBy?.name ?? "—"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label="View receipt"
                    onClick={() => onViewReceipt(payment.id)}
                  >
                    <ReceiptIcon className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
