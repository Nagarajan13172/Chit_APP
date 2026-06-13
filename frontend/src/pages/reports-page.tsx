import { format, parseISO } from "date-fns";
import { X } from "lucide-react";
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { DatePicker } from "@/components/common/date-picker";
import { PageHeader } from "@/components/common/page-header";
import { PaginationBar } from "@/components/common/pagination-bar";
import { StatCard } from "@/components/common/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { usePlanOptions } from "@/features/plans/queries";
import { CollectionsByModeChart } from "@/features/reports/charts/collections-by-mode-chart";
import { CollectionsByPlanChart } from "@/features/reports/charts/collections-by-plan-chart";
import { DefaultersTable } from "@/features/reports/defaulters-table";
import { useCollectionsReport, usePendingReport } from "@/features/reports/queries";
import { formatCurrency } from "@/lib/format";
import type { CollectionsReportParams, PendingReportParams } from "@/types/report";
import type { PaymentMode } from "@/types/payment";

const ALL = "all";
const DEFAULTERS_PAGE_SIZE = 20;

export function ReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const tab = searchParams.get("tab") === "defaulters" ? "defaulters" : "collections";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const mode = (searchParams.get("mode") as PaymentMode | null) ?? "";
  const planId = searchParams.get("planId") ?? "";
  const page = Number(searchParams.get("page") ?? "1") || 1;

  const setParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(updates)) {
            if (value === undefined || value === "") next.delete(key);
            else next.set(key, value);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const { data: planOptions = [] } = usePlanOptions();

  const collectionsParams = useMemo<CollectionsReportParams>(
    () => ({
      from: from || undefined,
      to: to || undefined,
      mode: (mode || undefined) as PaymentMode | undefined,
      planId: planId ? Number(planId) : undefined,
    }),
    [from, to, mode, planId],
  );
  const collectionsQuery = useCollectionsReport(collectionsParams);
  const report = collectionsQuery.data;

  const pendingParams = useMemo<PendingReportParams>(
    () => ({ page, limit: DEFAULTERS_PAGE_SIZE, planId: planId ? Number(planId) : undefined }),
    [page, planId],
  );
  const pendingQuery = usePendingReport(pendingParams);

  const hasCollectionFilters = Boolean(from || to || mode || planId);

  const planSelect = (
    <Select
      value={planId || ALL}
      onValueChange={(value) => setParams({ planId: value === ALL ? undefined : value, page: undefined })}
    >
      <SelectTrigger className="w-full sm:w-56">
        <SelectValue placeholder="All plans" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>All plans</SelectItem>
        {planOptions.map((plan) => (
          <SelectItem key={plan.id} value={String(plan.id)}>
            {plan.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <>
      <PageHeader title="Reports" description="Collections analytics and outstanding dues." />

      <Tabs value={tab} onValueChange={(value) => setParams({ tab: value, page: undefined })}>
        <TabsList>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="defaulters">Defaulters</TabsTrigger>
        </TabsList>

        {/* Collections report */}
        <TabsContent value="collections" className="mt-4 space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="w-40">
              <DatePicker
                value={from ? parseISO(from) : undefined}
                onChange={(date) => setParams({ from: date ? format(date, "yyyy-MM-dd") : undefined })}
                placeholder="From"
              />
            </div>
            <div className="w-40">
              <DatePicker
                value={to ? parseISO(to) : undefined}
                onChange={(date) => setParams({ to: date ? format(date, "yyyy-MM-dd") : undefined })}
                placeholder="To"
              />
            </div>
            {planSelect}
            <Select
              value={mode || ALL}
              onValueChange={(value) => setParams({ mode: value === ALL ? undefined : value })}
            >
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="All modes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All modes</SelectItem>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="CHEQUE">Cheque</SelectItem>
              </SelectContent>
            </Select>
            {hasCollectionFilters ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setParams({ from: undefined, to: undefined, mode: undefined, planId: undefined })
                }
              >
                <X className="size-4" />
                Clear
              </Button>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {collectionsQuery.isLoading || !report ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
            ) : (
              <>
                <StatCard label="Collected" value={formatCurrency(report.totals.amount)} />
                <StatCard label="Late fees" value={formatCurrency(report.totals.lateFees)} />
                <StatCard label="Total" value={formatCurrency(report.totals.totalCollected)} />
                <StatCard label="Payments" value={report.totals.count} />
              </>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">By mode</CardTitle>
              </CardHeader>
              <CardContent>
                {collectionsQuery.isLoading || !report ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <CollectionsByModeChart data={report.byMode} />
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">By plan</CardTitle>
              </CardHeader>
              <CardContent>
                {collectionsQuery.isLoading || !report ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <CollectionsByPlanChart data={report.byPlan} />
                )}
              </CardContent>
            </Card>
          </div>

          {report && report.byPlan.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan</TableHead>
                    <TableHead className="text-right">Collected</TableHead>
                    <TableHead className="text-right">Payments</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.byPlan.map((row) => (
                    <TableRow key={row.planId}>
                      <TableCell className="font-medium">{row.planName}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(row.amount)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{row.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : null}
        </TabsContent>

        {/* Defaulters report */}
        <TabsContent value="defaulters" className="mt-4 space-y-4">
          <div className="flex items-center gap-3">{planSelect}</div>
          <DefaultersTable
            rows={pendingQuery.data?.data ?? []}
            isLoading={pendingQuery.isLoading}
            isError={pendingQuery.isError}
            rowCount={DEFAULTERS_PAGE_SIZE}
          />
          {pendingQuery.data?.pagination ? (
            <PaginationBar
              page={pendingQuery.data.pagination.page}
              limit={pendingQuery.data.pagination.limit}
              total={pendingQuery.data.pagination.total}
              totalPages={pendingQuery.data.pagination.totalPages}
              onPageChange={(p) => setParams({ page: p === 1 ? undefined : String(p) })}
              disabled={pendingQuery.isFetching}
            />
          ) : null}
        </TabsContent>
      </Tabs>
    </>
  );
}
