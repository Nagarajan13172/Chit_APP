import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
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
import type { PlanMember } from "@/types/plan";
import { MembershipStatusBadge } from "./status-badges";

interface PlanMembersTableProps {
  members: PlanMember[];
  isLoading: boolean;
  isError: boolean;
}

const COLUMN_COUNT = 7;

export function PlanMembersTable({ members, isLoading, isError }: PlanMembersTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20 text-center">Ticket</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Area</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Installments</TableHead>
            <TableHead className="w-28 text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isError ? (
            <TableRow>
              <TableCell colSpan={COLUMN_COUNT} className="h-24 text-center text-sm text-destructive">
                Failed to load members.
              </TableCell>
            </TableRow>
          ) : isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: COLUMN_COUNT }).map((__, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : members.length === 0 ? (
            <TableRow>
              <TableCell colSpan={COLUMN_COUNT} className="h-24 text-center text-sm text-muted-foreground">
                No members assigned yet.
              </TableCell>
            </TableRow>
          ) : (
            members.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="text-center font-medium tabular-nums">
                  {member.ticketNumber ?? "—"}
                </TableCell>
                <TableCell>
                  <Link to={`/customers/${member.customer.id}`} className="font-medium hover:underline">
                    {member.customer.name}
                  </Link>
                </TableCell>
                <TableCell className="tabular-nums">{member.customer.phone}</TableCell>
                <TableCell className="text-muted-foreground">
                  {member.customer.area ?? "—"}
                </TableCell>
                <TableCell>
                  <MembershipStatusBadge status={member.status} />
                </TableCell>
                <TableCell className="text-center tabular-nums">
                  {member._count?.installments ?? 0}
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild size="sm" variant="ghost">
                    <Link to={`/collections/memberships/${member.id}`}>
                      Schedule
                      <ChevronRight className="size-4" />
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
