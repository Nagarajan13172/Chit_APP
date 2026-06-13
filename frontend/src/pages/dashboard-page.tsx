import { ComingSoon } from "@/components/common/coming-soon";
import { PageHeader } from "@/components/common/page-header";
import { useUser } from "@/hooks/use-auth";

export function DashboardPage() {
  const user = useUser();
  const firstName = user?.name.split(" ")[0] ?? "there";

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="KPIs, collections and defaulters land here in F5."
      />
      <ComingSoon phase="F5 — Dashboard & Reports" />
    </>
  );
}
