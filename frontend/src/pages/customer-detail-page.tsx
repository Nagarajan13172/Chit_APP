import { ArrowLeft, Pencil, Wallet } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerFormDialog } from "@/features/customers/customer-form-dialog";
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

export function CustomerDetailPage() {
  const { id } = useParams();
  const customerId = Number(id);
  const { data: customer, isLoading, isError } = useCustomer(customerId);
  const [editOpen, setEditOpen] = useState(false);

  const backButton = (
    <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 w-fit text-muted-foreground">
      <Link to="/customers">
        <ArrowLeft className="size-4" />
        Back to customers
      </Link>
    </Button>
  );

  if (isLoading) {
    return (
      <div>
        {backButton}
        <Skeleton className="mb-6 h-9 w-64" />
        <Card>
          <CardContent className="grid gap-6 p-6 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !customer) {
    return (
      <div>
        {backButton}
        <Card>
          <CardContent className="flex min-h-[30vh] flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm text-muted-foreground">Customer not found.</p>
            <Button asChild variant="outline" size="sm">
              <Link to="/customers">Back to customers</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {backButton}
      <PageHeader title={customer.name} description={`Customer #${customer.id}`}>
        <Button asChild variant="outline">
          <Link to={`/collections/customers/${customer.id}`}>
            <Wallet className="size-4" />
            Collections
          </Link>
        </Button>
        <Button variant="outline" onClick={() => setEditOpen(true)}>
          <Pencil className="size-4" />
          Edit
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
            <Field label="Created">{formatDate(customer.createdAt)}</Field>
            <Field label="Updated">{formatDate(customer.updatedAt)}</Field>
            <div className="sm:col-span-2 lg:col-span-3">
              <Field label="Address">{customer.address ?? "—"}</Field>
            </div>
          </dl>
        </CardContent>
      </Card>

      <CustomerFormDialog open={editOpen} onOpenChange={setEditOpen} customer={customer} />
    </div>
  );
}
