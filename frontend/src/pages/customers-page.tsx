import { ComingSoon } from "@/components/common/coming-soon";
import { PageHeader } from "@/components/common/page-header";

export function CustomersPage() {
  return (
    <>
      <PageHeader title="Customers" description="Manage customers, search and edit details." />
      <ComingSoon phase="F2 — Customers" />
    </>
  );
}
