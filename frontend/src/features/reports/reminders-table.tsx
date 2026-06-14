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
import type { ReminderRow } from "@/types/report";

interface RemindersTableProps {
  rows: ReminderRow[];
  variant: "dueSoon" | "overdue";
  isLoading: boolean;
  isError: boolean;
  rowCount?: number;
}

const COLUMN_COUNT = 5;

/** A "Today" / "Tomorrow" / "N days late" chip describing the due timing. */
function WhenBadge({ row, variant }: { row: ReminderRow; variant: RemindersTableProps["variant"] }) {
  if (variant === "overdue") {
    const days = Math.max(1, row.daysOverdue);
    return (
      <Badge variant="destructive" className="font-normal">
        {days} day{days === 1 ? "" : "s"} late
      </Badge>
    );
  }
  // dueSoon: daysOverdue is 0 (today) or -1 (tomorrow)
  return row.daysOverdue === 0 ? (
    <Badge className="border-transparent bg-amber-500 font-normal text-white hover:bg-amber-500">
      Today
    </Badge>
  ) : (
    <Badge variant="secondary" className="font-normal">
      Tomorrow
    </Badge>
  );
}

export function RemindersTable({ rows, variant, isLoading, isError, rowCount = 5 }: RemindersTableProps) {
  const emptyMessage =
    variant === "overdue"
      ? "No overdue installments. 🎉"
      : "Nothing due today or tomorrow. 🎉";

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Due</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isError ? (
            <TableRow>
              <TableCell colSpan={COLUMN_COUNT} className="h-24 text-center text-sm text-destructive">
                Failed to load reminders.
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
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.installmentId}>
                <TableCell className="font-medium">
                  <Link to={`/customers/${row.customer.id}`} className="hover:underline">
                    {row.customer.name}
                  </Link>
                  <div className="text-xs font-normal tabular-nums text-muted-foreground">
                    {row.customer.phone}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <Link to={`/plans/${row.plan.id}`} className="hover:underline">
                    {row.plan.name}
                  </Link>
                  <div className="text-xs">
                    Month {row.monthNumber}
                    {row.ticketNumber != null ? ` · Ticket #${row.ticketNumber}` : ""}
                  </div>
                </TableCell>
                <TableCell className="max-w-[220px] text-sm text-muted-foreground">
                  <span className="line-clamp-2">{row.customer.address ?? row.customer.area ?? "—"}</span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-start gap-1">
                    <WhenBadge row={row} variant={variant} />
                    <span className="text-xs text-muted-foreground">{formatDate(row.dueDate)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatCurrency(row.pending, 2)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
