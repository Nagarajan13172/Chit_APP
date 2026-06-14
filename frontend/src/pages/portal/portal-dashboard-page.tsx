import { format } from "date-fns";
import {
  AlertTriangle,
  Bell,
  CalendarClock,
  CheckCircle2,
  Loader2,
  Plus,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReceiptDialog } from "@/features/payments/receipt-dialog";
import { usePortalDashboard, usePortalPay } from "@/features/portal/queries";
import { usePortalCustomer } from "@/hooks/use-portal-auth";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PortalReceipt } from "@/types/portal";

function Kpi({
  label,
  value,
  sub,
  icon: Icon,
  iconClass,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: ComponentType<{ className?: string }>;
  iconClass?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          <Icon className={cn("size-5", iconClass)} />
        </div>
        <p className="mt-2 text-2xl font-bold tabular-nums">{value}</p>
        {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
      </CardContent>
    </Card>
  );
}

export function PortalDashboardPage() {
  const customer = usePortalCustomer();
  const firstName = customer?.name.split(" ")[0] ?? "there";
  const { data, isLoading } = usePortalDashboard();

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

  // Alert the member once per visit when they have past-due installments.
  const overdueToastShown = useRef(false);
  useEffect(() => {
    if (data && data.summary.overdueCount > 0 && !overdueToastShown.current) {
      overdueToastShown.current = true;
      const { overdueCount, overdueAmount } = data.summary;
      toast.error(
        `You have ${overdueCount} overdue payment${overdueCount === 1 ? "" : "s"} totaling ${formatCurrency(
          overdueAmount,
        )}.`,
      );
    }
  }, [data]);

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const { summary, nextDue, chits, recentPayments } = data;

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {firstName}</h1>
          <p className="text-sm text-muted-foreground">Today is {format(new Date(), "MMM d, yyyy")}</p>
        </div>
        <Button onClick={() => toast.info("Contact your agent to join a new chit.")}>
          <Plus className="size-4" />
          Join New Chit
        </Button>
      </div>

      {summary.overdueCount > 0 ? (
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle className="size-5 shrink-0 text-destructive" />
            <div>
              <p className="font-semibold text-destructive">
                {summary.overdueCount} overdue payment{summary.overdueCount === 1 ? "" : "s"}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(summary.overdueAmount)} is past its due date. Please pay to avoid penalties.
              </p>
            </div>
          </div>
          {nextDue ? (
            <Button
              variant="destructive"
              onClick={() => handlePay(nextDue.membershipId)}
              disabled={payMutation.isPending}
              className="sm:shrink-0"
            >
              {payingId === nextDue.membershipId ? <Loader2 className="size-4 animate-spin" /> : null}
              Pay Now
            </Button>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Total Invested"
          value={formatCurrency(summary.totalInvested)}
          sub="Amount paid to date"
          icon={Wallet}
          iconClass="text-blue-600"
        />
        <Kpi
          label="Total Value"
          value={formatCurrency(summary.totalValue)}
          sub={`${summary.activeChits} active chit${summary.activeChits === 1 ? "" : "s"}`}
          icon={TrendingUp}
          iconClass="text-emerald-600"
        />
        <Kpi
          label="Pending"
          value={formatCurrency(summary.totalPending)}
          sub={`${summary.overdueCount} overdue installments`}
          icon={CalendarClock}
          iconClass="text-amber-600"
        />
        <Kpi
          label="Next Due"
          value={nextDue ? formatCurrency(nextDue.amount) : "—"}
          sub={nextDue ? `${nextDue.planName} · ${formatDate(nextDue.dueDate)}` : "Nothing due"}
          icon={Bell}
          iconClass="text-rose-600"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Active chits */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Your Active Chits</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Chit Group</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Next Due</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-sm text-muted-foreground">
                      You are not part of any chit yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  chits.map((chit) => (
                    <TableRow key={chit.membershipId}>
                      <TableCell>
                        <p className="font-medium">{chit.planName}</p>
                        <p className="text-xs text-muted-foreground">
                          Ticket #{chit.ticketNumber ?? "—"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="w-36 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="tabular-nums text-muted-foreground">
                              {chit.paidMonths}/{chit.totalMonths}
                            </span>
                            <span className="tabular-nums text-muted-foreground">{chit.progress}%</span>
                          </div>
                          <Progress value={chit.progress} className="h-1.5" />
                        </div>
                      </TableCell>
                      <TableCell>
                        {chit.nextDue ? (
                          <>
                            <p className="font-medium tabular-nums">
                              {formatCurrency(chit.nextDue.amount)}
                            </p>
                            <p
                              className={cn(
                                "text-xs",
                                chit.nextDue.isOverdue ? "text-destructive" : "text-muted-foreground",
                              )}
                            >
                              {chit.nextDue.isOverdue ? "Overdue · " : "Due "}
                              {formatDate(chit.nextDue.dueDate)}
                            </p>
                          </>
                        ) : (
                          <span className="text-sm text-emerald-600">Fully paid</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {chit.nextDue ? (
                          <Button
                            size="sm"
                            onClick={() => handlePay(chit.membershipId)}
                            disabled={payMutation.isPending}
                          >
                            {payingId === chit.membershipId ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : null}
                            Pay Now
                          </Button>
                        ) : (
                          <Badge variant="secondary" className="font-normal">
                            Done
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Right column: upcoming payment + recent activity */}
        <div className="space-y-6">
          {nextDue ? (
            <div className="rounded-xl bg-blue-600 p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex size-9 items-center justify-center rounded-lg bg-white/20">
                  <Bell className="size-5" />
                </div>
                {nextDue.isOverdue ? (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">Urgent</span>
                ) : null}
              </div>
              <p className="mt-4 text-sm text-white/80">Upcoming Payment</p>
              <p className="text-lg font-semibold">{nextDue.planName}</p>
              <p className="text-3xl font-bold tabular-nums">{formatCurrency(nextDue.amount)}</p>
              <Button
                onClick={() => handlePay(nextDue.membershipId)}
                disabled={payMutation.isPending}
                className="mt-4 w-full bg-white text-blue-700 hover:bg-white/90"
              >
                {payingId === nextDue.membershipId ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                Make Payment Now
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border bg-card p-5 text-center text-sm text-muted-foreground">
              You're all paid up. 🎉
            </div>
          )}

          <div>
            <h2 className="mb-3 text-lg font-semibold">Recent Activity</h2>
            {recentPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent payments.</p>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((payment) => (
                  <Card key={payment.id}>
                    <CardContent className="flex items-start gap-3 p-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                        <CheckCircle2 className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">Payment Successful</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {payment.planName} · Month #{payment.monthNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatDate(payment.paidAt)}</p>
                      </div>
                      <span className="ml-auto text-sm font-medium tabular-nums">
                        {formatCurrency(payment.amount)}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ReceiptDialog open={receiptOpen} onOpenChange={setReceiptOpen} receipt={receipt} />
    </>
  );
}
