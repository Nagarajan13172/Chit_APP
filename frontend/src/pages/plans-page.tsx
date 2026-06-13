import { Plus, Search, X } from "lucide-react";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { RoleGuard } from "@/components/auth/role-guard";
import { PageHeader } from "@/components/common/page-header";
import { PaginationBar } from "@/components/common/pagination-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { PlanFormDialog } from "@/features/plans/plan-form-dialog";
import { PlansTable } from "@/features/plans/plans-table";
import { usePlans } from "@/features/plans/queries";
import type { PlanListParams, PlanSortBy, PlanStatus } from "@/types/plan";
import type { SortOrder } from "@/types/common";

const PAGE_SIZE = 10;
const ALL_STATUS = "all";

export function PlansPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const openView = (id: number) =>
    navigate({ pathname: `/plans/${id}`, search: location.search });

  const search = searchParams.get("search") ?? "";
  const status = (searchParams.get("status") as PlanStatus | null) ?? "";
  const page = Number(searchParams.get("page") ?? "1") || 1;
  const sortBy = (searchParams.get("sortBy") as PlanSortBy | null) ?? "createdAt";
  const sortOrder = (searchParams.get("sortOrder") as SortOrder | null) ?? "desc";

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

  const params = useMemo<PlanListParams>(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: search || undefined,
      status: (status || undefined) as PlanStatus | undefined,
      sortBy,
      sortOrder,
    }),
    [page, search, status, sortBy, sortOrder],
  );

  const { data, isLoading, isError, isFetching } = usePlans(params);
  const plans = data?.data ?? [];
  const pagination = data?.pagination;

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSort = (column: PlanSortBy) => {
    if (column === sortBy) {
      setParams({ sortOrder: sortOrder === "asc" ? "desc" : "asc", page: undefined });
    } else {
      setParams({
        sortBy: column,
        sortOrder: column === "name" ? "asc" : "desc",
        page: undefined,
      });
    }
  };

  const clearSearch = () => {
    setSearchInput("");
    setParams({ search: undefined, page: undefined });
  };

  return (
    <>
      <PageHeader title="Chit Plans" description="Create plans and assign members.">
        <RoleGuard roles={["ADMIN"]}>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" />
            Create plan
          </Button>
        </RoleGuard>
      </PageHeader>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search plans by name…"
            className="pl-9 pr-9"
          />
          {searchInput ? (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>

        <Select
          value={status || ALL_STATUS}
          onValueChange={(value) =>
            setParams({ status: value === ALL_STATUS ? undefined : value, page: undefined })
          }
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STATUS}>All statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <PlansTable
          plans={plans}
          isLoading={isLoading}
          isError={isError}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onView={openView}
          rowCount={PAGE_SIZE}
        />

        {pagination ? (
          <PaginationBar
            page={pagination.page}
            limit={pagination.limit}
            total={pagination.total}
            totalPages={pagination.totalPages}
            onPageChange={(p) => setParams({ page: p === 1 ? undefined : String(p) })}
            disabled={isFetching}
          />
        ) : null}
      </div>

      <PlanFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      {/* Detail side sheet (nested route /plans/:id) */}
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
    </>
  );
}
