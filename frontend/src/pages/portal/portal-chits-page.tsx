import { Loader2 } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { InstallmentScheduleTable } from "@/features/collections/installment-schedule-table";
import { MembershipStatusBadge } from "@/features/plans/status-badges";
import { ReceiptDialog } from "@/features/payments/receipt-dialog";
import { usePortalChits, usePortalPay } from "@/features/portal/queries";
import { formatCurrency } from "@/lib/format";
import type { PortalReceipt } from "@/types/portal";

export function PortalChitsPage() {
  const { data, isLoading } = usePortalChits();
  const payMutation = usePortalPay();
  const [receipt, setReceipt] = useState<PortalReceipt | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const handlePay = (membershipId: number) => {
    payMutation.mutate(membershipId, {
      onSuccess: (value) => {
        setReceipt(value);
        setReceiptOpen(true);
      },
    });
  };
  const payingId = payMutation.isPending ? payMutation.variables : null;

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <>
      <PageHeader title="My Chits" description="Your chit memberships and installment schedules." />

      {data.memberships.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-[30vh] items-center justify-center text-sm text-muted-foreground">
            You are not part of any chit yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {data.memberships.map((m) => {
            const progress =
              m.summary.totalDue > 0
                ? Math.round((m.summary.totalPaid / m.summary.totalDue) * 100)
                : 0;
            const canPay = m.summary.totalPending > 0 && m.status !== "COMPLETED";
            return (
              <Card key={m.membershipId}>
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold">{m.plan.name}</h2>
                        <MembershipStatusBadge status={m.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Ticket #{m.ticketNumber ?? "—"} · Paid {formatCurrency(m.summary.totalPaid)} of{" "}
                        {formatCurrency(m.summary.totalDue)}
                      </p>
                    </div>
                    {canPay ? (
                      <Button onClick={() => handlePay(m.membershipId)} disabled={payMutation.isPending}>
                        {payingId === m.membershipId ? <Loader2 className="size-4 animate-spin" /> : null}
                        Pay Next ({formatCurrency(m.summary.totalPending)} pending)
                      </Button>
                    ) : null}
                  </div>
                  <Progress value={progress} className="mt-3 h-1.5" />
                </CardHeader>
                <CardContent>
                  <InstallmentScheduleTable installments={m.installments} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ReceiptDialog open={receiptOpen} onOpenChange={setReceiptOpen} receipt={receipt} />
    </>
  );
}
