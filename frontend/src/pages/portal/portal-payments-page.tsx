import { PageHeader } from "@/components/common/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaymentModeBadge } from "@/features/payments/payment-mode-badge";
import { usePortalPayments } from "@/features/portal/queries";
import { formatCurrency, formatDate } from "@/lib/format";

export function PortalPaymentsPage() {
  const { data, isLoading } = usePortalPayments();
  const payments = data ?? [];

  return (
    <>
      <PageHeader title="Payments" description="Your full payment history." />
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Receipt</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Chit Group</TableHead>
              <TableHead className="text-center">Month</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Mode</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                  No payments yet.
                </TableCell>
              </TableRow>
            ) : (
              payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.receiptNumber}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(p.paidAt)}</TableCell>
                  <TableCell>{p.plan.name}</TableCell>
                  <TableCell className="text-center tabular-nums">{p.monthNumber}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(p.amount, 2)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(p.totalCollected, 2)}
                  </TableCell>
                  <TableCell>
                    <PaymentModeBadge mode={p.mode} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
