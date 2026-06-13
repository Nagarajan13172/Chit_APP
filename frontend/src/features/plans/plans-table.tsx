import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { SortableHeader } from "@/components/common/sortable-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";
import type { ChitPlan, PlanSortBy } from "@/types/plan";
import type { SortOrder } from "@/types/common";
import { PlanStatusBadge } from "./status-badges";

interface PlansTableProps {
  plans: ChitPlan[];
  isLoading: boolean;
  isError: boolean;
  sortBy: PlanSortBy;
  sortOrder: SortOrder;
  onSort: (column: PlanSortBy) => void;
  rowCount?: number;
}

const COLUMN_COUNT = 7;

export function PlansTable({
  plans,
  isLoading,
  isError,
  sortBy,
  sortOrder,
  onSort,
  rowCount = 10,
}: PlansTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader
              label="Name"
              active={sortBy === "name"}
              order={sortOrder}
              onClick={() => onSort("name")}
            />
            <TableHead className="text-right">Chit value</TableHead>
            <TableHead className="text-right">Installment</TableHead>
            <TableHead className="text-center">Duration</TableHead>
            <TableHead className="text-center">Members</TableHead>
            <SortableHeader
              label="Start"
              active={sortBy === "startDate"}
              order={sortOrder}
              onClick={() => onSort("startDate")}
            />
            <TableHead>Status</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isError ? (
            <TableRow>
              <TableCell colSpan={COLUMN_COUNT + 1} className="h-32 text-center text-sm text-destructive">
                Failed to load plans. Please retry.
              </TableCell>
            </TableRow>
          ) : isLoading ? (
            Array.from({ length: rowCount }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: COLUMN_COUNT + 1 }).map((__, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : plans.length === 0 ? (
            <TableRow>
              <TableCell colSpan={COLUMN_COUNT + 1} className="h-32 text-center text-sm text-muted-foreground">
                No plans found.
              </TableCell>
            </TableRow>
          ) : (
            plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell className="font-medium">
                  <Link to={`/plans/${plan.id}`} className="hover:underline">
                    {plan.name}
                  </Link>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(plan.chitValue)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(plan.installmentAmount)}
                </TableCell>
                <TableCell className="text-center tabular-nums">{plan.durationMonths} mo</TableCell>
                <TableCell className="text-center tabular-nums">
                  {plan._count?.memberships ?? 0}
                  <span className="text-muted-foreground"> / {plan.totalMembers}</span>
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(plan.startDate)}</TableCell>
                <TableCell>
                  <PlanStatusBadge status={plan.status} />
                </TableCell>
                <TableCell>
                  <Button asChild variant="ghost" size="icon" className="size-8" aria-label="View plan">
                    <Link to={`/plans/${plan.id}`}>
                      <Eye className="size-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
