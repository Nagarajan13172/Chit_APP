import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm, type UseFormSetError } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { ApiFieldError } from "@/api/types";
import type { Customer } from "@/types/customer";
import {
  customerFormSchema,
  emptyCustomerForm,
  toCustomerPayload,
  toFormValues,
  type CustomerFormValues,
} from "./customer-schema";
import { useCreateCustomer, useUpdateCustomer } from "./queries";

const FORM_FIELDS = ["name", "phone", "email", "address", "area"] as const;

/** Map backend validation/conflict errors onto the matching form fields. */
function applyServerFieldErrors(
  error: unknown,
  setError: UseFormSetError<CustomerFormValues>,
): void {
  if (!axios.isAxiosError(error)) return;
  const data = error.response?.data as { message?: string; errors?: ApiFieldError[] } | undefined;

  if (Array.isArray(data?.errors)) {
    for (const fieldError of data.errors) {
      if ((FORM_FIELDS as readonly string[]).includes(fieldError.field)) {
        setError(fieldError.field as (typeof FORM_FIELDS)[number], { message: fieldError.message });
      }
    }
    return;
  }

  // Unique-phone conflict (409) has no `errors[]` — pin it to the phone field.
  if (error.response?.status === 409) {
    setError("phone", { message: data?.message ?? "This phone number already exists" });
  }
}

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass a customer to edit; omit to create. */
  customer?: Customer | null;
}

export function CustomerFormDialog({ open, onOpenChange, customer }: CustomerFormDialogProps) {
  const isEdit = Boolean(customer);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: emptyCustomerForm,
  });

  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer(customer?.id ?? 0);
  const isPending = createMutation.isPending || updateMutation.isPending;

  // Reset to the right values whenever the dialog opens or the target changes.
  useEffect(() => {
    if (open) {
      form.reset(customer ? toFormValues(customer) : emptyCustomerForm);
    }
  }, [open, customer, form]);

  const onSubmit = (values: CustomerFormValues) => {
    const payload = toCustomerPayload(values);
    const mutation = isEdit ? updateMutation : createMutation;
    mutation.mutate(payload, {
      onSuccess: () => onOpenChange(false),
      onError: (error) => applyServerFieldErrors(error, form.setError),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit customer" : "Add customer"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the customer's details."
              : "Create a new customer. Phone must be a unique 10-digit number."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="10-digit number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.replace(/\D/g, "").slice(0, 10))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Area <span className="text-muted-foreground">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Anna Nagar" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email <span className="text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Address <span className="text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="Street, city…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {isEdit ? "Save changes" : "Create customer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
