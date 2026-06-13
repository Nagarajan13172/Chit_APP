import { ArrowLeft, Loader2, Lock, LockOpen, Plus } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { RoleGuard } from "@/components/auth/role-guard";
import { PageHeader } from "@/components/common/page-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { AssignMemberDialog } from "@/features/plans/assign-member-dialog";
import { PlanMembersTable } from "@/features/plans/plan-members-table";
import { usePlan, usePlanMembers, useUpdatePlanStatus } from "@/features/plans/queries";
import { PlanStatusBadge } from "@/features/plans/status-badges";
import { formatCurrency, formatDate } from "@/lib/format";

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export function PlanDetailPage() {
  const { id } = useParams();
  const planId = Number(id);
  const { data: plan, isLoading, isError } = usePlan(planId);
  const membersQuery = usePlanMembers(planId);
  const members = membersQuery.data ?? [];
  const [assignOpen, setAssignOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const statusMutation = useUpdatePlanStatus(planId);

  const backButton = (
    <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 w-fit text-muted-foreground">
      <Link to="/plans">
        <ArrowLeft className="size-4" />
        Back to plans
      </Link>
    </Button>
  );

  if (isLoading) {
    return (
      <div>
        {backButton}
        <Skeleton className="mb-6 h-9 w-64" />
        <Card>
          <CardContent className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !plan) {
    return (
      <div>
        {backButton}
        <Card>
          <CardContent className="flex min-h-[30vh] flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm text-muted-foreground">Chit plan not found.</p>
            <Button asChild variant="outline" size="sm">
              <Link to="/plans">Back to plans</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const memberCount = plan._count?.memberships ?? members.length;
  const capacityPct =
    plan.totalMembers > 0 ? Math.min(100, Math.round((memberCount / plan.totalMembers) * 100)) : 0;
  const isClosed = plan.status !== "ACTIVE";
  const isFull = memberCount >= plan.totalMembers;
  const nextStatus = plan.status === "ACTIVE" ? "CLOSED" : "ACTIVE";

  return (
    <div>
      {backButton}
      <PageHeader title={plan.name} description={`Plan #${plan.id}`}>
        <PlanStatusBadge status={plan.status} />
        <RoleGuard roles={["ADMIN"]}>
          <Button
            variant="outline"
            onClick={() => setStatusDialogOpen(true)}
            disabled={statusMutation.isPending}
          >
            {plan.status === "ACTIVE" ? (
              <>
                <Lock className="size-4" />
                Close plan
              </>
            ) : (
              <>
                <LockOpen className="size-4" />
                Reopen
              </>
            )}
          </Button>
        </RoleGuard>
      </PageHeader>

      <Card>
        <CardContent className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Chit value" value={formatCurrency(plan.chitValue)} />
          <Stat label="Installment" value={formatCurrency(plan.installmentAmount)} />
          <Stat label="Duration" value={`${plan.durationMonths} months`} />
          <Stat label="Start date" value={formatDate(plan.startDate)} />
          <div className="space-y-2 sm:col-span-2 lg:col-span-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Members</span>
              <span className="font-medium tabular-nums">
                {memberCount} / {plan.totalMembers}
              </span>
            </div>
            <Progress value={capacityPct} />
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Members</h2>
          <RoleGuard roles={["ADMIN"]}>
            <Button size="sm" onClick={() => setAssignOpen(true)} disabled={isClosed || isFull}>
              <Plus className="size-4" />
              Assign customer
            </Button>
          </RoleGuard>
        </div>

        {isClosed ? (
          <p className="text-sm text-muted-foreground">This plan is closed — members can’t be added.</p>
        ) : isFull ? (
          <p className="text-sm text-muted-foreground">This plan is at full capacity.</p>
        ) : null}

        <PlanMembersTable
          members={members}
          isLoading={membersQuery.isLoading}
          isError={membersQuery.isError}
        />
      </div>

      <AssignMemberDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        plan={plan}
        members={members}
      />

      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {plan.status === "ACTIVE" ? "Close this plan?" : "Reopen this plan?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {plan.status === "ACTIVE"
                ? "Closing stops new member assignments and payment collection for this plan. You can reopen it anytime."
                : "Reopening allows member assignments and payment collection again."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={statusMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                statusMutation.mutate(nextStatus, { onSuccess: () => setStatusDialogOpen(false) });
              }}
              disabled={statusMutation.isPending}
            >
              {statusMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {plan.status === "ACTIVE" ? "Close plan" : "Reopen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
