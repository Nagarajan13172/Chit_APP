import { parseISO } from "date-fns";
import { format } from "date-fns";
import { X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/common/page-header";
import { PaginationBar } from "@/components/common/pagination-bar";
import { DatePicker } from "@/components/common/date-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomerCombobox } from "@/features/customers/customer-combobox";
import { PaymentsTable } from "@/features/payments/payments-table";
import { usePayments } from "@/features/payments/queries";
import { ReceiptDialog } from "@/features/payments/receipt-dialog";
import type { PaymentListParams, PaymentMode } from "@/types/payment";

const PAGE_SIZE = 10;
const ALL_MODES = "all";

export function CollectionsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const mode = (searchParams.get("mode") as PaymentMode | null) ?? "";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
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

  const params = useMemo<PaymentListParams>(
    () => ({
      page,
      limit: PAGE_SIZE,
      mode: (mode || undefined) as PaymentMode | undefined,
      from: from || undefined,
      to: to || undefined,
    }),
    [page, mode, from, to],
  );

  const { data, isLoading, isError, isFetching } = usePayments(params);
  const payments = data?.data ?? [];
  const pagination = data?.pagination;

  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptPaymentId, setReceiptPaymentId] = useState<number | null>(null);

  const openReceipt = (paymentId: number) => {
    setReceiptPaymentId(paymentId);
    setReceiptOpen(true);
  };

  const hasFilters = Boolean(mode || from || to);

  return (
    <>
      <PageHeader title="Collections" description="Collect payments and review recent receipts." />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Collect a payment</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2 text-sm text-muted-foreground">
            Find a customer to view their plans, installment schedule and collect.
          </p>
          <div className="max-w-sm">
            <CustomerCombobox
              value={null}
              onChange={(customer) => {
                if (customer) navigate(`/collections/customers/${customer.id}`);
              }}
              placeholder="Search a customer…"
            />
          </div>
        </CardContent>
      </Card>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-lg font-semibold">Recent payments</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={mode || ALL_MODES}
            onValueChange={(value) =>
              setParams({ mode: value === ALL_MODES ? undefined : value, page: undefined })
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All modes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_MODES}>All modes</SelectItem>
              <SelectItem value="CASH">Cash</SelectItem>
              <SelectItem value="UPI">UPI</SelectItem>
              <SelectItem value="CHEQUE">Cheque</SelectItem>
            </SelectContent>
          </Select>

          <div className="w-40">
            <DatePicker
              value={from ? parseISO(from) : undefined}
              onChange={(date) =>
                setParams({ from: date ? format(date, "yyyy-MM-dd") : undefined, page: undefined })
              }
              placeholder="From"
            />
          </div>
          <div className="w-40">
            <DatePicker
              value={to ? parseISO(to) : undefined}
              onChange={(date) =>
                setParams({ to: date ? format(date, "yyyy-MM-dd") : undefined, page: undefined })
              }
              placeholder="To"
            />
          </div>

          {hasFilters ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setParams({ mode: undefined, from: undefined, to: undefined, page: undefined })}
            >
              <X className="size-4" />
              Clear
            </Button>
          ) : null}
        </div>
      </div>

      <div className="space-y-4">
        <PaymentsTable
          payments={payments}
          isLoading={isLoading}
          isError={isError}
          onViewReceipt={openReceipt}
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

      <ReceiptDialog open={receiptOpen} onOpenChange={setReceiptOpen} paymentId={receiptPaymentId} />
    </>
  );
}
