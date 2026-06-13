import { Plus, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
import { CustomerFormDialog } from "@/features/customers/customer-form-dialog";
import { CustomersTable } from "@/features/customers/customers-table";
import { useCustomerAreas, useCustomers } from "@/features/customers/queries";
import type { Customer, CustomerListParams, CustomerSortBy, SortOrder } from "@/types/customer";

const PAGE_SIZE = 10;
const ALL_AREAS = "all";

export function CustomersPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL is the source of truth for filters/sort/page (shareable + back-button safe).
  const search = searchParams.get("search") ?? "";
  const area = searchParams.get("area") ?? "";
  const page = Number(searchParams.get("page") ?? "1") || 1;
  const sortBy = (searchParams.get("sortBy") as CustomerSortBy | null) ?? "createdAt";
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

  // Debounced search box → URL (resets to page 1 on change).
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebouncedValue(searchInput, 350);
  useEffect(() => {
    if (debouncedSearch !== search) {
      setParams({ search: debouncedSearch || undefined, page: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const params = useMemo<CustomerListParams>(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: search || undefined,
      area: area || undefined,
      sortBy,
      sortOrder,
    }),
    [page, search, area, sortBy, sortOrder],
  );

  const { data, isLoading, isError, isFetching } = useCustomers(params);
  const { data: areas = [] } = useCustomerAreas();

  const customers = data?.data ?? [];
  const pagination = data?.pagination;

  // Dialog state: null target = create, a customer = edit.
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

  const handleSort = (column: CustomerSortBy) => {
    if (column === sortBy) {
      setParams({ sortOrder: sortOrder === "asc" ? "desc" : "asc", page: undefined });
    } else {
      setParams({
        sortBy: column,
        sortOrder: column === "createdAt" ? "desc" : "asc",
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
      <PageHeader title="Customers" description="Manage customers, search and edit details.">
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Add customer
        </Button>
      </PageHeader>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or phone…"
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
          value={area || ALL_AREAS}
          onValueChange={(value) =>
            setParams({ area: value === ALL_AREAS ? undefined : value, page: undefined })
          }
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All areas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_AREAS}>All areas</SelectItem>
            {areas.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <CustomersTable
          customers={customers}
          isLoading={isLoading}
          isError={isError}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onEdit={openEdit}
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

      <CustomerFormDialog open={dialogOpen} onOpenChange={setDialogOpen} customer={editing} />
    </>
  );
}
