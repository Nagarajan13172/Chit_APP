import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
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
import type { PendingReportItem } from "@/types/report";

interface DefaultersTableProps {
  rows: PendingReportItem[];
  isLoading: boolean;
  isError: boolean;
  rowCount?: number;
}

const COLUMN_COUNT = 6;

export function DefaultersTable({ rows, isLoading, isError, rowCount = 5 }: DefaultersTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead className="text-right">Pending</TableHead>
            <TableHead className="text-center">Overdue</TableHead>
            <TableHead>Oldest overdue</TableHead>
            <TableHead className="text-right">Phone</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isError ? (
            <TableRow>
              <TableCell colSpan={COLUMN_COUNT} className="h-24 text-center text-sm text-destructive">
                Failed to load defaulters.
              </TableCell>
            </TableRow>
          ) : isLoading ? (
            Array.from({ length: rowCount }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: COLUMN_COUNT }).map((__, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={COLUMN_COUNT} className="h-24 text-center text-sm text-muted-foreground">
                No outstanding dues. 🎉
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.membershipId}>
                <TableCell className="font-medium">
                  <Link to={`/customers/${row.customer.id}`} className="hover:underline">
                    {row.customer.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <Link to={`/plans/${row.plan.id}`} className="hover:underline">
                    {row.plan.name}
                  </Link>
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatCurrency(row.pending, 2)}
                </TableCell>
                <TableCell className="text-center">
                  {row.overdueCount > 0 ? (
                    <Badge variant="destructive" className="font-normal">
                      {row.overdueCount}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">0</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(row.oldestOverdueDate)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {row.customer.phone}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
