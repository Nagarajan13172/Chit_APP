import { Badge } from "@/components/ui/badge";
import type { MembershipStatus, PlanStatus } from "@/types/plan";

const PLAN_VARIANT: Record<PlanStatus, "default" | "secondary"> = {
  ACTIVE: "default",
  CLOSED: "secondary",
};

export function PlanStatusBadge({ status }: { status: PlanStatus }) {
  return (
    <Badge variant={PLAN_VARIANT[status]} className="font-normal">
      {status === "ACTIVE" ? "Active" : "Closed"}
    </Badge>
  );
}

const MEMBERSHIP_VARIANT: Record<MembershipStatus, "default" | "secondary" | "destructive"> = {
  ACTIVE: "default",
  COMPLETED: "secondary",
  DEFAULTED: "destructive",
};

const MEMBERSHIP_LABEL: Record<MembershipStatus, string> = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  DEFAULTED: "Defaulted",
};

export function MembershipStatusBadge({ status }: { status: MembershipStatus }) {
  return (
    <Badge variant={MEMBERSHIP_VARIANT[status]} className="font-normal">
      {MEMBERSHIP_LABEL[status]}
    </Badge>
  );
}
