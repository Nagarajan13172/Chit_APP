import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { RemindersTable } from "@/features/reports/reminders-table";
import { useReminders } from "@/features/reports/queries";

export function RemindersPage() {
  const { data, isLoading, isError } = useReminders();
  const dueSoon = data?.dueSoon ?? [];
  const overdue = data?.overdue ?? [];

  return (
    <>
      <PageHeader
        title="Reminders"
        description="Customers to collect from — due today/tomorrow and past-due."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Due today & tomorrow"
          value={data?.counts.dueSoon ?? 0}
          valueClassName={(data?.counts.dueSoon ?? 0) > 0 ? "text-amber-600" : undefined}
          hint="Collect soon"
        />
        <StatCard
          label="Overdue"
          value={data?.counts.overdue ?? 0}
          valueClassName={(data?.counts.overdue ?? 0) > 0 ? "text-destructive" : undefined}
          hint="Due date already passed"
        />
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold">Due today &amp; tomorrow</h2>
        <RemindersTable rows={dueSoon} variant="dueSoon" isLoading={isLoading} isError={isError} />
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold">Overdue</h2>
        <RemindersTable rows={overdue} variant="overdue" isLoading={isLoading} isError={isError} />
      </section>
    </>
  );
}
