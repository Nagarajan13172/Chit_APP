import { ArrowLeft, ChevronRight, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCustomerHistory, useCustomerPending } from "@/features/collections/queries";
import { PaymentModeBadge } from "@/features/payments/payment-mode-badge";
import { ReceiptDialog } from "@/features/payments/receipt-dialog";
import { formatCurrency, formatDate } from "@/lib/format";
import type { PaymentMode } from "@/types/payment";

interface HistoryPaymentRow {
  id: number;
  paidAt: string;
  planName: string;
  monthNumber: number;
  amount: number;
  lateFee: number;
  mode: PaymentMode;
  receiptNumber: string;
}

export function CustomerCollectionsPage() {
  const { id } = useParams();
  const customerId = Number(id);
  const pendingQuery = useCustomerPending(customerId);
  const historyQuery = useCustomerHistory(customerId);

  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptPaymentId, setReceiptPaymentId] = useState<number | null>(null);
  const openReceipt = (paymentId: number) => {
    setReceiptPaymentId(paymentId);
    setReceiptOpen(true);
  };

  const historyPayments = useMemo<HistoryPaymentRow[]>(() => {
    const history = historyQuery.data;
    if (!history) return [];
    const rows: HistoryPaymentRow[] = [];
    for (const membership of history.memberships) {
      for (const inst of membership.installments) {
        for (const payment of inst.payments ?? []) {
          rows.push({
            id: payment.id,
            paidAt: payment.paidAt,
            planName: membership.plan.name,
            monthNumber: inst.monthNumber,
            amount: payment.amount,
            lateFee: payment.lateFee,
            mode: payment.mode,
            receiptNumber: payment.receiptNumber,
          });
        }
      }
    }
    rows.sort((a, b) => b.paidAt.localeCompare(a.paidAt));
    return rows;
  }, [historyQuery.data]);

  const pending = pendingQuery.data;
  const customerName = pending?.customerName ?? historyQuery.data?.customer.name ?? "Customer";

  const backButton = (
    <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground">
      <Link to="/collections">
        <ArrowLeft className="size-4" />
        Back to collections
      </Link>
    </Button>
  );

  if (pendingQuery.isLoading) {
    return (
      <div>
        {backButton}
        <Skeleton className="mb-6 h-9 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (pendingQuery.isError || !pending) {
    return (
      <div>
        {backButton}
        <Card>
          <CardContent className="flex min-h-[30vh] flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm text-muted-foreground">Customer not found.</p>
            <Button asChild variant="outline" size="sm">
              <Link to="/collections">Back to collections</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {backButton}
      <PageHeader title={customerName} description="Pending dues and payment history">
        <Button asChild variant="outline" size="sm">
          <Link to={`/customers/${customerId}`}>
            <UserRound className="size-4" />
            Profile
          </Link>
        </Button>
      </PageHeader>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total due" value={formatCurrency(pending.totalDue, 2)} />
        <StatCard label="Total paid" value={formatCurrency(pending.totalPaid, 2)} />
        <StatCard
          label="Pending"
          value={formatCurrency(pending.totalPending, 2)}
          valueClassName={pending.totalPending > 0 ? "text-amber-600" : undefined}
        />
        <StatCard
          label="Overdue"
          value={pending.overdueCount}
          valueClassName={pending.overdueCount > 0 ? "text-destructive" : undefined}
        />
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Plans &amp; Pending</TabsTrigger>
          <TabsTrigger value="history">Payment history</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Due</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                  <TableHead className="text-center">Overdue</TableHead>
                  <TableHead className="w-32 text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.byPlan.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground">
                      No plans assigned.
                    </TableCell>
                  </TableRow>
                ) : (
                  pending.byPlan.map((row) => (
                    <TableRow key={row.membershipId}>
                      <TableCell className="font-medium">
                        <Link to={`/plans/${row.planId}`} className="hover:underline">
                          {row.planName}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(row.totalDue, 2)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(row.totalPaid, 2)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(row.pending, 2)}
                      </TableCell>
                      <TableCell className="text-center">
                        {row.overdueCount > 0 ? (
                          <Badge variant="destructive" className="font-normal">
                            {row.overdueCount}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/collections/memberships/${row.membershipId}`}>
                            Schedule
                            <ChevronRight className="size-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-center">Month</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Late fee</TableHead>
                  <TableHead>Mode</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyQuery.isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((__, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : historyPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                      No payments recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  historyPayments.map((row) => (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer"
                      onClick={() => openReceipt(row.id)}
                    >
                      <TableCell className="font-mono text-xs">{row.receiptNumber}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(row.paidAt)}</TableCell>
                      <TableCell>{row.planName}</TableCell>
                      <TableCell className="text-center tabular-nums">{row.monthNumber}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(row.amount, 2)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(row.lateFee, 2)}
                      </TableCell>
                      <TableCell>
                        <PaymentModeBadge mode={row.mode} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <ReceiptDialog open={receiptOpen} onOpenChange={setReceiptOpen} paymentId={receiptPaymentId} />
    </div>
  );
}
