import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/common/date-picker";
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
  FormDescription,
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
import { applyServerFieldErrors } from "@/lib/form-errors";
import { formatCurrency } from "@/lib/format";
import type { ChitPlan } from "@/types/plan";
import {
  planFormDefaults,
  planFormSchema,
  toFormValues,
  toPlanPayload,
  type PlanFormValues,
} from "./plan-schema";
import { useCreatePlan, useUpdatePlan } from "./queries";

const PLAN_FIELDS = [
  "name",
  "chitValue",
  "installmentAmount",
  "durationMonths",
  "totalMembers",
  "startDate",
  "status",
] as const;

interface PlanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass a plan to edit; omit to create. */
  plan?: ChitPlan | null;
}

export function PlanFormDialog({ open, onOpenChange, plan }: PlanFormDialogProps) {
  const isEdit = Boolean(plan);
  const memberCount = plan?._count?.memberships ?? 0;
  // Financial/structural terms are locked once members are assigned (the backend
  // enforces this too, since each membership has a generated installment schedule).
  const termsLocked = isEdit && memberCount > 0;

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: planFormDefaults,
  });

  const createMutation = useCreatePlan();
  const updateMutation = useUpdatePlan(plan?.id ?? 0);
  const isPending = createMutation.isPending || updateMutation.isPending;

  // Reset to the right values whenever the dialog opens or the target changes.
  useEffect(() => {
    if (open) {
      form.reset(plan ? toFormValues(plan) : planFormDefaults);
    }
  }, [open, plan, form]);

  const onSubmit = (values: PlanFormValues) => {
    const mutation = isEdit ? updateMutation : createMutation;
    mutation.mutate(toPlanPayload(values), {
      onSuccess: () => onOpenChange(false),
      onError: (error) => applyServerFieldErrors(error, form.setError, PLAN_FIELDS),
    });
  };

  // Live preview of the installment the backend will derive when left blank.
  const chitValue = Number(form.watch("chitValue"));
  const duration = Number(form.watch("durationMonths"));
  const derivedInstallment =
    chitValue > 0 && Number.isInteger(duration) && duration > 0
      ? Number((chitValue / duration).toFixed(2))
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit chit plan" : "Create chit plan"}</DialogTitle>
          <DialogDescription>
            {termsLocked
              ? `This plan has ${memberCount} member(s). Chit value, installment, duration and start date are locked; you can still rename it, change its status, or raise the member cap.`
              : "Define the plan. The installment defaults to chit value ÷ duration when left blank."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Gold Monthly 1L" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="chitValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chit value (₹)</FormLabel>
                    <FormControl>
                      <Input inputMode="decimal" placeholder="100000" disabled={termsLocked} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="installmentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Installment (₹) <span className="text-muted-foreground">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input inputMode="decimal" placeholder="Auto" disabled={termsLocked} {...field} />
                    </FormControl>
                    {derivedInstallment !== null && !field.value ? (
                      <FormDescription>Defaults to {formatCurrency(derivedInstallment, 2)}</FormDescription>
                    ) : null}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="durationMonths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (months)</FormLabel>
                    <FormControl>
                      <Input inputMode="numeric" placeholder="20" disabled={termsLocked} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalMembers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total members</FormLabel>
                    <FormControl>
                      <Input inputMode="numeric" placeholder="20" {...field} />
                    </FormControl>
                    {termsLocked ? (
                      <FormDescription>Cannot be below {memberCount} already assigned.</FormDescription>
                    ) : null}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start date</FormLabel>
                    <DatePicker value={field.value} onChange={field.onChange} disabled={termsLocked} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                {isEdit ? "Save changes" : "Create plan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
