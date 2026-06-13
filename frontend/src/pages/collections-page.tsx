import { ComingSoon } from "@/components/common/coming-soon";
import { PageHeader } from "@/components/common/page-header";

export function CollectionsPage() {
  return (
    <>
      <PageHeader
        title="Collections"
        description="Installment schedules and the Collect Payment flow."
      />
      <ComingSoon phase="F4 — Collections & Collect Payment" />
    </>
  );
}
