import { Loader2 } from "lucide-react";

/** Suspense fallback shown in the content area while a route chunk loads. */
export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}
