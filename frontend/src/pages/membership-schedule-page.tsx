import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { InstallmentScheduleTable } from "@/features/collections/installment-schedule-table";
import { useMembershipSchedule } from "@/features/collections/queries";
import { CollectPaymentDialog } from "@/features/payments/collect-payment-dialog";
import { ReceiptDialog } from "@/features/payments/receipt-dialog";
import { MembershipStatusBadge } from "@/features/plans/status-badges";
import { formatCurrency } from "@/lib/format";
import type { InstallmentView } from "@/types/collection";
import type { Receipt } from "@/types/payment";

export function MembershipSchedulePage() {
  const { id } = useParams();
  const membershipId = Number(id);
  const { data, isLoading, isError } = useMembershipSchedule(membershipId);

  const [collectInst, setCollectInst] = useState<InstallmentView | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [receiptPaymentId, setReceiptPaymentId] = useState<number | null>(null);

  const showReceiptFromPayment = (paymentId: number) => {
    setReceipt(null);
    setReceiptPaymentId(paymentId);
    setReceiptOpen(true);
  };
  const showReceiptFromObject = (value: Receipt) => {
    setReceiptPaymentId(null);
    setReceipt(value);
    setReceiptOpen(true);
  };

  if (isLoading) {
    return (
      <div>
        <Skeleton className="mb-2 h-8 w-40" />
        <Skeleton className="mb-6 h-9 w-72" />
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground">
          <Link to="/collections">
            <ArrowLeft className="size-4" />
            Back to collections
          </Link>
        </Button>
        <Card>
          <CardContent className="flex min-h-[30vh] flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm text-muted-foreground">Membership not found.</p>
            <Button asChild variant="outline" size="sm">
              <Link to="/collections">Back to collections</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { membership, summary, installments } = data;
  const meta = {
    customerName: membership.customer.name,
    planName: membership.plan.name,
    ticketNumber: membership.ticketNumber,
  };

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground">
        <Link to={`/collections/customers/${membership.customer.id}`}>
          <ArrowLeft className="size-4" />
          Back to {membership.customer.name}
        </Link>
      </Button>

      <PageHeader
        title={membership.plan.name}
        description={`${membership.customer.name} · ${membership.customer.phone} · Ticket #${
          membership.ticketNumber ?? "—"
        }`}
      >
        <MembershipStatusBadge status={membership.status} />
      </PageHeader>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total due" value={formatCurrency(summary.totalDue, 2)} />
        <StatCard label="Total paid" value={formatCurrency(summary.totalPaid, 2)} />
        <StatCard
          label="Pending"
          value={formatCurrency(summary.totalPending, 2)}
          valueClassName={summary.totalPending > 0 ? "text-amber-600" : undefined}
        />
        <StatCard
          label="Overdue"
          value={summary.overdueCount}
          valueClassName={summary.overdueCount > 0 ? "text-destructive" : undefined}
          hint={`${summary.paidCount}/${summary.installmentCount} installments paid`}
        />
      </div>

      <InstallmentScheduleTable
        installments={installments}
        onCollect={setCollectInst}
        onViewReceipt={showReceiptFromPayment}
      />

      {collectInst ? (
        <CollectPaymentDialog
          open
          onOpenChange={(next) => {
            if (!next) setCollectInst(null);
          }}
          installment={collectInst}
          meta={meta}
          onPaid={showReceiptFromObject}
        />
      ) : null}

      <ReceiptDialog
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        receipt={receipt}
        paymentId={receiptPaymentId}
      />
    </div>
  );
}
