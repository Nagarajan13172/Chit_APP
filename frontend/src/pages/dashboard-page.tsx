import { ArrowRight, BellRing } from "lucide-react";
import { Link } from "react-router-dom";
import { ErrorState } from "@/components/common/error-state";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CollectionsByModeChart } from "@/features/reports/charts/collections-by-mode-chart";
import { CollectionsByPlanChart } from "@/features/reports/charts/collections-by-plan-chart";
import { DefaultersTable } from "@/features/reports/defaulters-table";
import {
  useCollectionsReport,
  usePendingReport,
  useReminders,
  useReportSummary,
} from "@/features/reports/queries";
import { useUser } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/format";

export function DashboardPage() {
  const user = useUser();
  const firstName = user?.name.split(" ")[0] ?? "there";

  const summaryQuery = useReportSummary();
  const collectionsQuery = useCollectionsReport({});
  const defaultersQuery = usePendingReport({ limit: 5 });
  const remindersQuery = useReminders();

  const summary = summaryQuery.data;
  const collections = collectionsQuery.data;
  const dueSoonCount = remindersQuery.data?.counts.dueSoon ?? 0;
  const overdueCount = remindersQuery.data?.counts.overdue ?? 0;

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Your chit collection at a glance."
      />

      {dueSoonCount > 0 || overdueCount > 0 ? (
        <Link
          to="/reminders"
          className="mb-6 flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm transition-colors hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/40 dark:hover:bg-amber-950/60"
        >
          <BellRing className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <span className="flex-1">
            <span className="font-medium">Collections need attention.</span>{" "}
            {dueSoonCount > 0 ? `${dueSoonCount} due today or tomorrow. ` : ""}
            {overdueCount > 0 ? (
              <span className="font-medium text-destructive">{overdueCount} overdue.</span>
            ) : null}
          </span>
          <span className="flex shrink-0 items-center gap-1 font-medium text-amber-700 dark:text-amber-300">
            View reminders
            <ArrowRight className="size-4" />
          </span>
        </Link>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {summaryQuery.isError ? (
          <div className="sm:col-span-2 lg:col-span-3">
            <ErrorState
              message="Couldn't load dashboard metrics."
              onRetry={() => summaryQuery.refetch()}
            />
          </div>
        ) : summaryQuery.isLoading || !summary ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
        ) : (
          <>
            <StatCard
              label="Active customers"
              value={summary.activeCustomers}
              hint={`of ${summary.totalCustomers} total`}
            />
            <StatCard
              label="Collections this month"
              value={formatCurrency(summary.collectionsThisMonth.amount)}
              hint={`${summary.collectionsThisMonth.count} payments · ${formatCurrency(
                summary.collectionsThisMonth.lateFees,
              )} late fees`}
            />
            <StatCard
              label="Defaulters"
              value={summary.pending.defaulters}
              valueClassName={summary.pending.defaulters > 0 ? "text-destructive" : undefined}
              hint={`${summary.pending.overdueInstallments} overdue installments`}
            />
            <StatCard label="Active groups" value={summary.activeChitGroups} />
            <StatCard label="Total collected" value={formatCurrency(summary.totalCollected)} />
            <StatCard
              label="Total pending"
              value={formatCurrency(summary.pending.totalPending)}
              valueClassName={summary.pending.totalPending > 0 ? "text-amber-600" : undefined}
            />
          </>
        )}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Collections by mode</CardTitle>
          </CardHeader>
          <CardContent>
            {collectionsQuery.isError ? (
              <ErrorState
                message="Couldn't load chart data."
                onRetry={() => collectionsQuery.refetch()}
              />
            ) : collectionsQuery.isLoading || !collections ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <CollectionsByModeChart data={collections.byMode} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top plans by collection</CardTitle>
          </CardHeader>
          <CardContent>
            {collectionsQuery.isError ? (
              <ErrorState
                message="Couldn't load chart data."
                onRetry={() => collectionsQuery.refetch()}
              />
            ) : collectionsQuery.isLoading || !collections ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <CollectionsByPlanChart data={collections.byPlan} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Top defaulters</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/reports?tab=defaulters">
              View all
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <DefaultersTable
          rows={defaultersQuery.data?.data ?? []}
          isLoading={defaultersQuery.isLoading}
          isError={defaultersQuery.isError}
        />
      </div>
    </>
  );
}
