import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CollectionsByModeChart } from "@/features/reports/charts/collections-by-mode-chart";
import { CollectionsByPlanChart } from "@/features/reports/charts/collections-by-plan-chart";
import { DefaultersTable } from "@/features/reports/defaulters-table";
import { useCollectionsReport, usePendingReport, useReportSummary } from "@/features/reports/queries";
import { useUser } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/format";

export function DashboardPage() {
  const user = useUser();
  const firstName = user?.name.split(" ")[0] ?? "there";

  const summaryQuery = useReportSummary();
  const collectionsQuery = useCollectionsReport({});
  const defaultersQuery = usePendingReport({ limit: 5 });

  const summary = summaryQuery.data;
  const collections = collectionsQuery.data;

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Your chit collection at a glance."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {summaryQuery.isLoading || !summary ? (
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
            {collectionsQuery.isLoading || !collections ? (
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
            {collectionsQuery.isLoading || !collections ? (
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
