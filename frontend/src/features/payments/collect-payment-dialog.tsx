import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { applyServerFieldErrors } from "@/lib/form-errors";
import { formatCurrency, formatDate } from "@/lib/format";
import type { InstallmentView } from "@/types/collection";
import type { Receipt } from "@/types/payment";
import {
  createPaymentFormSchema,
  paymentFormDefaults,
  toPaymentPayload,
  type PaymentFormValues,
} from "./payment-schema";
import { useRecordPayment } from "./queries";

const PAYMENT_FIELDS = ["amount", "lateFee", "mode", "referenceNumber", "notes"] as const;

interface CollectPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  installment: InstallmentView;
  meta: { customerName: string; planName: string; ticketNumber: number | null };
  onPaid: (receipt: Receipt) => void;
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? "text-base font-semibold" : "text-sm"}`}>
      <span className={strong ? "" : "text-muted-foreground"}>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
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

  const mode = form.watch("mode");
  const amountNum = Number(form.watch("amount")) || 0;
  const lateFeeNum = Number(form.watch("lateFee")) || 0;
  const totalCollected = Math.round((amountNum + lateFeeNum) * 100) / 100;
  const pendingAfter = Math.max(0, Math.round((installment.pending - amountNum) * 100) / 100);
  const requiresReference = mode === "UPI" || mode === "CHEQUE";

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Collect payment</DialogTitle>
          <DialogDescription>
            {meta.customerName} · {meta.planName}
            {meta.ticketNumber != null ? ` · Ticket #${meta.ticketNumber}` : ""} · Month{" "}
            {installment.monthNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1 rounded-md border bg-muted/40 p-3">
          <SummaryRow
            label={`Due (${formatDate(installment.dueDate)})`}
            value={formatCurrency(installment.dueAmount, 2)}
          />
          <SummaryRow label="Paid so far" value={formatCurrency(installment.paidAmount, 2)} />
          <SummaryRow label="Pending" value={formatCurrency(installment.pending, 2)} strong />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <FormLabel>
                      Late fee (₹) <span className="text-muted-foreground">(opt.)</span>
                    </FormLabel>
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
              name="mode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mode</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="CHEQUE">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {requiresReference ? (
              <FormField
                control={form.control}
                name="referenceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference number</FormLabel>
                    <FormControl>
                      <Input placeholder="UTR / cheque no." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Notes <span className="text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />
            <div className="space-y-1">
              <SummaryRow label="Amount" value={formatCurrency(amountNum, 2)} />
              <SummaryRow label="Late fee" value={formatCurrency(lateFeeNum, 2)} />
              <SummaryRow label="Total collected" value={formatCurrency(totalCollected, 2)} strong />
              <SummaryRow label="Pending after" value={formatCurrency(pendingAfter, 2)} />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={recordMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={recordMutation.isPending}>
                {recordMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Collect {formatCurrency(totalCollected, 2)}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
