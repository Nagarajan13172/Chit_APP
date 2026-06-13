import { zodResolver } from "@hookform/resolvers/zod";
import { Banknote, CheckCircle2, FileText, Loader2, Smartphone } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { applyServerFieldErrors } from "@/lib/form-errors";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { InstallmentView } from "@/types/collection";
import type { PaymentMode, Receipt } from "@/types/payment";
import {
  createPaymentFormSchema,
  paymentFormDefaults,
  toPaymentPayload,
  type PaymentFormValues,
} from "./payment-schema";
import { useRecordPayment } from "./queries";

const PAYMENT_FIELDS = ["amount", "lateFee", "mode", "referenceNumber", "notes"] as const;

const MODES: { value: PaymentMode; label: string; icon: typeof Banknote }[] = [
  { value: "CASH", label: "Cash", icon: Banknote },
  { value: "UPI", label: "UPI", icon: Smartphone },
  { value: "CHEQUE", label: "Cheque", icon: FileText },
];

interface CollectPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  installment: InstallmentView;
  meta: { customerName: string; planName: string; ticketNumber: number | null };
  onPaid: (receipt: Receipt) => void;
}

export function CollectPaymentDialog({
  open,
  onOpenChange,
  installment,
  meta,
  onPaid,
}: CollectPaymentDialogProps) {
  const schema = useMemo(() => createPaymentFormSchema(installment.pending), [installment.pending]);
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: paymentFormDefaults(installment.pending),
  });
  const recordMutation = useRecordPayment();

  useEffect(() => {
    if (open) form.reset(paymentFormDefaults(installment.pending));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, installment.id, installment.pending]);

  const amountNum = Number(form.watch("amount")) || 0;
  const lateFeeNum = Number(form.watch("lateFee")) || 0;
  const totalCollected = Math.round((amountNum + lateFeeNum) * 100) / 100;

  const onSubmit = (values: PaymentFormValues) => {
    recordMutation.mutate(toPaymentPayload(values, installment.id), {
      onSuccess: (receipt) => {
        onOpenChange(false);
        onPaid(receipt);
      },
      onError: (error) => applyServerFieldErrors(error, form.setError, PAYMENT_FIELDS),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] gap-0 overflow-y-auto p-0 sm:max-w-md">
        <DialogHeader className="sr-only">
          <DialogTitle>Collect Payment</DialogTitle>
        </DialogHeader>

        {/* Customer / due-amount band */}
        <div className="flex items-start justify-between gap-4 rounded-t-lg bg-blue-50 p-5 dark:bg-blue-950/40">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
              Customer Name
            </p>
            <p className="truncate text-lg font-bold">{meta.customerName}</p>
            <p className="text-xs text-muted-foreground">
              {meta.planName} · Ticket #{meta.ticketNumber ?? "—"} · Month {installment.monthNumber}
            </p>
          </div>
          <div className="shrink-0 rounded-md border bg-background px-3 py-2 text-right">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Due Amount
            </p>
            <p className="text-lg font-bold tabular-nums">{formatCurrency(installment.pending, 2)}</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 p-5">
            {/* Payment mode radio cards */}
            <FormField
              control={form.control}
              name="mode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">Select Payment Mode</FormLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {MODES.map((m) => {
                      const active = field.value === m.value;
                      return (
                        <button
                          key={m.value}
                          type="button"
                          onClick={() => field.onChange(m.value)}
                          className={cn(
                            "flex items-center justify-between rounded-lg border p-3 text-sm transition-colors",
                            active
                              ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600 dark:bg-blue-950/40"
                              : "hover:bg-accent",
                          )}
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className={cn(
                                "flex size-4 items-center justify-center rounded-full border",
                                active ? "border-blue-600" : "border-muted-foreground/40",
                              )}
                            >
                              {active ? <span className="size-2 rounded-full bg-blue-600" /> : null}
                            </span>
                            <span className="font-medium">{m.label}</span>
                          </span>
                          <m.icon className="size-4 text-muted-foreground" />
                        </button>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (₹)</FormLabel>
                    <FormControl>
                      <Input inputMode="decimal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lateFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Late Fee (₹)</FormLabel>
                    <FormControl>
                      <Input inputMode="decimal" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="referenceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction ID / Reference Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter ID for digital payments" {...field} />
                  </FormControl>
                  <FormDescription>Required for UPI and Cheque payments.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="Add internal notes about this collection…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Collection summary */}
            <div className="rounded-lg border bg-muted/40 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Collection Summary
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Installment Amount</span>
                  <span className="tabular-nums">{formatCurrency(amountNum, 2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Late Fee (if any)</span>
                  <span className="tabular-nums">{formatCurrency(lateFeeNum, 2)}</span>
                </div>
                <Separator className="my-1" />
                <div className="flex justify-between text-base font-bold">
                  <span>Total Amount Collected</span>
                  <span className="tabular-nums text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(totalCollected, 2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={recordMutation.isPending}
              >
                {recordMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
                Confirm Collection &amp; Generate Receipt
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => onOpenChange(false)}
                disabled={recordMutation.isPending}
              >
                Cancel
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Due {formatDate(installment.dueDate)} · {formatCurrency(installment.pending, 2)} pending
            </p>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
