import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { SortOrder } from "@/types/common";

interface SortableHeaderProps {
  label: string;
  active: boolean;
  order: SortOrder;
  onClick: () => void;
  className?: string;
}

/** Clickable table header that toggles sort and shows the active direction. */
export function SortableHeader({ label, active, order, onClick, className }: SortableHeaderProps) {
  const Icon = active ? (order === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={onClick}
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
