import { ComingSoon } from "@/components/common/coming-soon";
import { PageHeader } from "@/components/common/page-header";

export function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Collections report and defaulters (admin only)."
      />
      <ComingSoon phase="F5 — Dashboard & Reports" />
    </>
  );
}
