import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
import {
  planFormDefaults,
  planFormSchema,
  toPlanPayload,
  type PlanFormValues,
} from "./plan-schema";
import { useCreatePlan } from "./queries";

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
}

export function PlanFormDialog({ open, onOpenChange }: PlanFormDialogProps) {
  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: planFormDefaults,
  });

  const createMutation = useCreatePlan();

  const onSubmit = (values: PlanFormValues) => {
    createMutation.mutate(toPlanPayload(values), {
      onSuccess: () => {
        onOpenChange(false);
        form.reset(planFormDefaults);
      },
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
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) form.reset(planFormDefaults);
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create chit plan</DialogTitle>
          <DialogDescription>
            Define the plan. The installment defaults to chit value ÷ duration when left blank.
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
                      <Input inputMode="decimal" placeholder="100000" {...field} />
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
                      <Input inputMode="decimal" placeholder="Auto" {...field} />
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
                      <Input inputMode="numeric" placeholder="20" {...field} />
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
                    <DatePicker value={field.value} onChange={field.onChange} />
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
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Create plan
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
