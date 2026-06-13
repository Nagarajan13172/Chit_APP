import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationBarProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Disables the controls (e.g. while a page is loading). */
  disabled?: boolean;
}

/** "Showing X–Y of N" plus Prev/Next controls. Reused across list screens. */
export function PaginationBar({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  disabled,
}: PaginationBarProps) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const lastPage = Math.max(totalPages, 1);

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        {total === 0 ? "No results" : `Showing ${from}–${to} of ${total}`}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <span className="px-1 text-sm text-muted-foreground">
          Page {page} of {lastPage}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || page >= lastPage}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
