import { ArrowDown, ArrowUp, ArrowUpDown, Eye, MoreHorizontal, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import type { Customer, CustomerSortBy, SortOrder } from "@/types/customer";

interface CustomersTableProps {
  customers: Customer[];
  isLoading: boolean;
  isError: boolean;
  sortBy: CustomerSortBy;
  sortOrder: SortOrder;
  onSort: (column: CustomerSortBy) => void;
  onEdit: (customer: Customer) => void;
  /** Number of skeleton rows while loading (keeps layout stable). */
  rowCount?: number;
}

function SortableHead({
  column,
  label,
  sortBy,
  sortOrder,
  onSort,
  className,
}: {
  column: CustomerSortBy;
  label: string;
  sortBy: CustomerSortBy;
  sortOrder: SortOrder;
  onSort: (column: CustomerSortBy) => void;
  className?: string;
}) {
  const active = sortBy === column;
  const Icon = active ? (sortOrder === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn(
          "-ml-2 inline-flex items-center gap-1 rounded px-2 py-1 text-sm font-medium hover:text-foreground",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
        <Icon className="size-3.5" />
      </button>
    </TableHead>
  );
}

export function CustomersTable({
  customers,
  isLoading,
  isError,
  sortBy,
  sortOrder,
  onSort,
  onEdit,
  rowCount = 10,
}: CustomersTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHead column="name" label="Name" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
            <SortableHead column="phone" label="Phone" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
            <TableHead>Email</TableHead>
            <TableHead>Area</TableHead>
            <TableHead className="text-center">Plans</TableHead>
            <SortableHead
              column="createdAt"
              label="Created"
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={onSort}
            />
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isError ? (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center text-sm text-destructive">
                Failed to load customers. Please retry.
              </TableCell>
            </TableRow>
          ) : isLoading ? (
            Array.from({ length: rowCount }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 7 }).map((__, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center text-sm text-muted-foreground">
                No customers found.
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">
                  <Link to={`/customers/${customer.id}`} className="hover:underline">
                    {customer.name}
                  </Link>
                </TableCell>
                <TableCell className="tabular-nums">{customer.phone}</TableCell>
                <TableCell className="text-muted-foreground">{customer.email ?? "—"}</TableCell>
                <TableCell>
                  {customer.area ? (
                    <Badge variant="secondary" className="font-normal">
                      {customer.area}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-center tabular-nums">
                  {customer._count?.memberships ?? 0}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(customer.createdAt)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8" aria-label="Row actions">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/customers/${customer.id}`}>
                          <Eye className="mr-2 size-4" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(customer)}>
                        <Pencil className="mr-2 size-4" />
                        Edit
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
