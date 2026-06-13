import { KeyRound, Pencil, Wallet } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerFormDialog } from "@/features/customers/customer-form-dialog";
import { PortalAccessDialog } from "@/features/customers/portal-access-dialog";
import { useCustomer } from "@/features/customers/queries";
import { formatDate } from "@/lib/format";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

/** Customer detail rendered as a right-side sheet (nested under /customers/:id). */
export function CustomerDetailSheet() {
  const { id } = useParams();
  const customerId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const { data: customer, isLoading, isError } = useCustomer(customerId);
  const [editOpen, setEditOpen] = useState(false);
  const [portalOpen, setPortalOpen] = useState(false);

  const close = () => navigate({ pathname: "/customers", search: location.search });

  return (
    <Sheet
      open
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{customer?.name ?? "Customer"}</SheetTitle>
          <SheetDescription>{customer ? `Customer #${customer.id}` : "Loading…"}</SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-4 py-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : isError || !customer ? (
          <div className="py-16 text-center text-sm text-muted-foreground">Customer not found.</div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to={`/collections/customers/${customer.id}`}>
                  <Wallet className="size-4" />
                  Collections
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPortalOpen(true)}>
                <KeyRound className="size-4" />
                {customer.portalEnabled ? "Portal access" : "Enable portal"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                <Pencil className="size-4" />
                Edit
              </Button>
            </div>

            <dl className="grid gap-5 sm:grid-cols-2">
              <Field label="Phone">
                <span className="tabular-nums">{customer.phone}</span>
              </Field>
              <Field label="Email">{customer.email ?? "—"}</Field>
              <Field label="Area">
                {customer.area ? (
                  <Badge variant="secondary" className="font-normal">
                    {customer.area}
                  </Badge>
                ) : (
                  "—"
                )}
              </Field>
              <Field label="Memberships">{customer._count?.memberships ?? 0}</Field>
              <Field label="Portal access">
                {customer.portalEnabled ? (
                  <Badge className="border-transparent bg-emerald-600 font-normal text-white">
                    Enabled
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="font-normal">
                    Not enabled
                  </Badge>
                )}
              </Field>
              <Field label="Created">{formatDate(customer.createdAt)}</Field>
              <Field label="Updated">{formatDate(customer.updatedAt)}</Field>
              <div className="sm:col-span-2">
                <Field label="Address">{customer.address ?? "—"}</Field>
              </div>
            </dl>
          </div>
        )}
      </SheetContent>

      {customer ? (
        <>
          <CustomerFormDialog open={editOpen} onOpenChange={setEditOpen} customer={customer} />
          <PortalAccessDialog
            open={portalOpen}
            onOpenChange={setPortalOpen}
            customerId={customer.id}
            customerName={customer.name}
            customerPhone={customer.phone}
            alreadyEnabled={Boolean(customer.portalEnabled)}
          />
        </>
      ) : null}
    </Sheet>
  );
}
