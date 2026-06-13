import { Eye, MoreHorizontal, Pencil } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { avatarTint, initials } from "@/lib/avatar";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Customer } from "@/types/customer";

interface CustomersTableProps {
  customers: Customer[];
  isLoading: boolean;
  isError: boolean;
  onView: (id: number) => void;
  onEdit: (customer: Customer) => void;
  rowCount?: number;
}

const COLUMN_COUNT = 7;

function StatusPill({ overdueCount }: { overdueCount: number }) {
  if (overdueCount > 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
        <span className="size-1.5 rounded-full bg-destructive" />
        Overdue ({overdueCount})
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
      <span className="size-1.5 rounded-full bg-emerald-500" />
      Up-to-date
    </span>
  );
}

export function CustomersTable({
  customers,
  isLoading,
  isError,
  onView,
  onEdit,
  rowCount = 10,
}: CustomersTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer Name &amp; ID</TableHead>
            <TableHead>Chit Group</TableHead>
            <TableHead className="text-right">Total Value</TableHead>
            <TableHead className="text-right">Amount Paid</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-16 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isError ? (
            <TableRow>
              <TableCell colSpan={COLUMN_COUNT} className="h-32 text-center text-sm text-destructive">
                Failed to load customers. Please retry.
              </TableCell>
            </TableRow>
          ) : isLoading ? (
            Array.from({ length: rowCount }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: COLUMN_COUNT }).map((__, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-9 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={COLUMN_COUNT} className="h-32 text-center text-sm text-muted-foreground">
                No customers found.
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => {
              const s = customer.summary;
              const hasGroup = (s?.groupCount ?? 0) > 0;
              const overdue = s?.overdueCount ?? 0;
              return (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarFallback className={cn("text-xs font-medium", avatarTint(customer.name))}>
                          {initials(customer.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => onView(customer.id)}
                          className="block max-w-full truncate text-left font-medium hover:underline"
                        >
                          {customer.name}
                        </button>
                        <span className="text-xs text-muted-foreground">ID: #CUST-{customer.id}</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    {hasGroup ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{s?.groupName}</span>
                        {s && s.groupCount > 1 ? (
                          <Badge variant="secondary" className="font-normal">
                            +{s.groupCount - 1}
                          </Badge>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  <TableCell className="text-right tabular-nums">
                    {hasGroup ? formatCurrency(s?.totalValue ?? 0) : "—"}
                  </TableCell>

                  <TableCell
                    className={cn(
                      "text-right font-medium tabular-nums",
                      hasGroup
                        ? overdue > 0
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-emerald-600 dark:text-emerald-400"
                        : "text-muted-foreground",
                    )}
                  >
                    {hasGroup ? formatCurrency(s?.amountPaid ?? 0) : "—"}
                  </TableCell>

                  <TableCell>
                    {hasGroup ? (
                      <div className="w-32 space-y-1">
                        <Progress value={s?.progress ?? 0} className="h-1.5" />
                        <span className="text-xs text-muted-foreground">
                          {s?.progress ?? 0}% Completed
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  <TableCell>
                    {hasGroup ? (
                      <StatusPill overdueCount={overdue} />
                    ) : (
                      <span className="text-xs text-muted-foreground">No plans</span>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8" aria-label="Row actions">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(customer.id)}>
                          <Eye className="mr-2 size-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(customer)}>
                          <Pencil className="mr-2 size-4" />
                          Edit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
