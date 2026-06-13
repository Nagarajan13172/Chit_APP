import { ComingSoon } from "@/components/common/coming-soon";
import { PageHeader } from "@/components/common/page-header";

export function PlansPage() {
  return (
    <>
      <PageHeader title="Chit Plans" description="Create plans and assign members." />
      <ComingSoon phase="F3 — Chit Plans" />
    </>
  );
}
