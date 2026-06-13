import { Download, Plus, Search } from "lucide-react";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { listCustomers } from "@/api/customers.api";
import { getApiErrorMessage } from "@/api/client";
import { DataPagination } from "@/components/common/data-pagination";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CustomerFormDialog } from "@/features/customers/customer-form-dialog";
import { CustomersTable } from "@/features/customers/customers-table";
import { useCustomerAreas, useCustomers } from "@/features/customers/queries";
import { usePlanOptions } from "@/features/plans/queries";
import { useReportSummary } from "@/features/reports/queries";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { downloadCsv } from "@/lib/csv";
import { formatCurrency } from "@/lib/format";
import type { Customer, CustomerListParams, CustomerStatusFilter } from "@/types/customer";

const PAGE_SIZE = 10;
const ALL = "all";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

export function CustomersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Open the detail sheet (nested /customers/:id) without losing list filters.
  const openView = (id: number) =>
    navigate({ pathname: `/customers/${id}`, search: location.search });

  const search = searchParams.get("search") ?? "";
  const area = searchParams.get("area") ?? "";
  const planId = searchParams.get("planId") ?? "";
  const status = searchParams.get("status") ?? "";
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

  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebouncedValue(searchInput, 350);
  useEffect(() => {
    if (debouncedSearch !== search) {
      setParams({ search: debouncedSearch || undefined, page: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const baseFilters = useMemo<CustomerListParams>(
    () => ({
      search: search || undefined,
      area: area || undefined,
      planId: planId ? Number(planId) : undefined,
      status: (status || undefined) as CustomerStatusFilter | undefined,
      withSummary: true,
    }),
    [search, area, planId, status],
  );
  const params = useMemo<CustomerListParams>(
    () => ({ ...baseFilters, page, limit: PAGE_SIZE }),
    [baseFilters, page],
  );

  const { data, isLoading, isError, isFetching } = useCustomers(params);
  const { data: areas = [] } = useCustomerAreas();
  const { data: planOptions = [] } = usePlanOptions();
  const { data: summary } = useReportSummary();

  const customers = data?.data ?? [];
  const pagination = data?.pagination;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (customer: Customer) => {
    setEditing(customer);
    setDialogOpen(true);
  };

  const [exporting, setExporting] = useState(false);
  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await listCustomers({ ...baseFilters, page: 1, limit: 1000 });
      const rows = res.data.map((c) => [
        `#CUST-${c.id}`,
        c.name,
        c.phone,
        c.email ?? "",
        c.area ?? "",
        c.summary?.groupName ?? "",
        c.summary?.groupCount ?? 0,
        c.summary?.totalValue ?? 0,
        c.summary?.amountPaid ?? 0,
        `${c.summary?.progress ?? 0}%`,
        (c.summary?.overdueCount ?? 0) > 0 ? `Overdue (${c.summary?.overdueCount})` : "Up-to-date",
      ]);
      downloadCsv(
        "customers.csv",
        ["ID", "Name", "Phone", "Email", "Area", "Chit Group", "Groups", "Total Value", "Amount Paid", "Progress", "Status"],
        rows,
      );
      toast.success(`Exported ${rows.length} customers`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Export failed"));
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Customer Management"
        description="Manage and monitor chit fund participants across all active groups."
      >
        <Button variant="outline" onClick={handleExport} disabled={exporting}>
          <Download className="size-4" />
          Export CSV
        </Button>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Add New Customer
        </Button>
      </PageHeader>

      <Card className="mb-6">
        <CardContent className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Search customer">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Name or phone…"
                className="pl-9"
              />
            </div>
          </Field>

          <Field label="Group">
            <Select
              value={planId || ALL}
              onValueChange={(value) =>
                setParams({ planId: value === ALL ? undefined : value, page: undefined })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Groups" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All Groups</SelectItem>
                {planOptions.map((plan) => (
                  <SelectItem key={plan.id} value={String(plan.id)}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Status">
            <Select
              value={status || ALL}
              onValueChange={(value) =>
                setParams({ status: value === ALL ? undefined : value, page: undefined })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All Statuses</SelectItem>
                <SelectItem value="UP_TO_DATE">Up-to-date</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Area">
            <Select
              value={area || ALL}
              onValueChange={(value) =>
                setParams({ area: value === ALL ? undefined : value, page: undefined })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Areas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All Areas</SelectItem>
                {areas.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <CustomersTable
          customers={customers}
          isLoading={isLoading}
          isError={isError}
          onView={openView}
          onEdit={openEdit}
          rowCount={PAGE_SIZE}
        />

        {pagination ? (
          <DataPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            itemLabel="customers"
            onPageChange={(p) => setParams({ page: p === 1 ? undefined : String(p) })}
            disabled={isFetching}
          />
        ) : null}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total active customers" value={summary ? summary.activeCustomers : "—"} />
        <StatCard
          label="Collections this month"
          value={summary ? formatCurrency(summary.collectionsThisMonth.amount) : "—"}
          valueClassName="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label="Pending defaults"
          value={summary ? summary.pending.defaulters : "—"}
          valueClassName="text-destructive"
        />
        <StatCard
          label="Active chit groups"
          value={summary ? summary.activeChitGroups : "—"}
          valueClassName="text-primary"
        />
      </div>

      <CustomerFormDialog open={dialogOpen} onOpenChange={setDialogOpen} customer={editing} />

      {/* Detail side sheet (nested route /customers/:id) */}
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
    </>
  );
}
