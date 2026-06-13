import { Pencil } from "lucide-react";
import { useState, type ReactNode } from "react";
import { PageHeader } from "@/components/common/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PortalProfileDialog } from "@/features/portal/portal-profile-dialog";
import { usePortalCustomer } from "@/hooks/use-portal-auth";
import { avatarTint, initials } from "@/lib/avatar";
import { cn } from "@/lib/utils";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

export function PortalProfilePage() {
  const customer = usePortalCustomer();
  const [editOpen, setEditOpen] = useState(false);
  if (!customer) return null;

  return (
    <>
      <PageHeader title="Profile" description="Your account details.">
        <Button variant="outline" onClick={() => setEditOpen(true)}>
          <Pencil className="size-4" />
          Edit profile
        </Button>
      </PageHeader>
      <Card>
        <CardContent className="p-6">
          <div className="mb-6 flex items-center gap-4">
            <Avatar className="size-14">
              <AvatarFallback className={cn("text-base font-medium", avatarTint(customer.name))}>
                {initials(customer.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{customer.name}</p>
              <p className="text-sm text-muted-foreground">Member #CUST-{customer.id}</p>
            </div>
          </div>
          <dl className="grid gap-6 sm:grid-cols-2">
            <Field label="Phone">
              <span className="tabular-nums">{customer.phone}</span>
            </Field>
            <Field label="Email">{customer.email ?? "—"}</Field>
            <Field label="Area">{customer.area ?? "—"}</Field>
            <Field label="Address">{customer.address ?? "—"}</Field>
          </dl>
          <p className="mt-6 text-xs text-muted-foreground">
            Your phone number is your login and is managed by your agent.
          </p>
        </CardContent>
      </Card>

      <PortalProfileDialog open={editOpen} onOpenChange={setEditOpen} customer={customer} />
    </>
  );
}
