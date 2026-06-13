import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";
import type { Customer } from "@/types/customer";
import { useCustomers } from "./queries";

interface CustomerComboboxProps {
  value: Customer | null;
  onChange: (customer: Customer | null) => void;
  /** Customers to hide from results (e.g. already assigned). */
  excludeIds?: number[];
  placeholder?: string;
}

/** Server-backed customer picker (search by name or phone). */
export function CustomerCombobox({
  value,
  onChange,
  excludeIds = [],
  placeholder = "Select a customer…",
}: CustomerComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, 300);

  const { data, isFetching } = useCustomers({
    search: debounced || undefined,
    limit: 8,
    sortBy: "name",
    sortOrder: "asc",
  });
  const results = (data?.data ?? []).filter((c) => !excludeIds.includes(c.id));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {value ? `${value.name} · ${value.phone}` : placeholder}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search by name or phone…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {isFetching ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Searching…
              </div>
            ) : results.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No customers found.
              </div>
            ) : (
              <CommandGroup>
                {results.map((customer) => (
                  <CommandItem
                    key={customer.id}
                    value={String(customer.id)}
                    onSelect={() => {
                      onChange(customer);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        value?.id === customer.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{customer.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {customer.phone}
                        {customer.area ? ` · ${customer.area}` : ""}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
