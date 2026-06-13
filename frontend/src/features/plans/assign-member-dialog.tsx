import { Loader2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { CustomerCombobox } from "@/features/customers/customer-combobox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Customer } from "@/types/customer";
import type { ChitPlan, PlanMember } from "@/types/plan";
import { useAssignMember } from "./queries";

interface AssignMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: ChitPlan;
  members: PlanMember[];
}

export function AssignMemberDialog({ open, onOpenChange, plan, members }: AssignMemberDialogProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [ticket, setTicket] = useState("");
  const assignMutation = useAssignMember(plan.id);

  const excludeIds = members.map((m) => m.customerId);
  const remaining = plan.totalMembers - members.length;

  // Reset fields each time the dialog opens.
  useEffect(() => {
    if (open) {
      setCustomer(null);
      setTicket("");
    }
  }, [open]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!customer) return;
    const trimmed = ticket.trim();
    assignMutation.mutate(
      { customerId: customer.id, ...(trimmed ? { ticketNumber: Number(trimmed) } : {}) },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign customer</DialogTitle>
          <DialogDescription>
            {remaining} of {plan.totalMembers} slots open. Leave the ticket number blank to
            auto-assign the next free slot.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Customer</Label>
            <CustomerCombobox value={customer} onChange={setCustomer} excludeIds={excludeIds} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticket">Ticket number (optional)</Label>
            <Input
              id="ticket"
              inputMode="numeric"
              placeholder={`Auto (1–${plan.totalMembers})`}
              value={ticket}
              onChange={(e) => setTicket(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={assignMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!customer || assignMutation.isPending}>
              {assignMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Assign customer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
