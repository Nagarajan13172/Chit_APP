import { Construction } from "lucide-react";

/** Placeholder body for module screens that ship in a later phase. */
export function ComingSoon({ phase }: { phase: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/20 p-8 text-center">
      <Construction className="h-10 w-10 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        This screen ships in <span className="font-medium text-foreground">{phase}</span>.
      </p>
    </div>
  );
}
