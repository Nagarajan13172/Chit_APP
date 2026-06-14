import { api } from "@/api/client";
import type { ApiSuccess } from "@/api/types";
import type {
  CollectionsReport,
  CollectionsReportParams,
  PendingReportParams,
  PendingReportResponse,
  RemindersReport,
  ReportSummary,
} from "@/types/report";

/** GET /reports/summary — dashboard KPI figures. */
export async function getSummary(): Promise<ReportSummary> {
  const { data } = await api.get<ApiSuccess<ReportSummary>>("/reports/summary");
  return data.data;
}

/** GET /reports/collections — totals + breakdown by mode and plan. */
export async function getCollectionsReport(
  params: CollectionsReportParams,
): Promise<CollectionsReport> {
  const { data } = await api.get<ApiSuccess<CollectionsReport>>("/reports/collections", { params });
  return data.data;
}

/** GET /reports/pending — paginated defaulters (worst first). */
export async function getPendingReport(params: PendingReportParams): Promise<PendingReportResponse> {
  const { data } = await api.get<PendingReportResponse>("/reports/pending", { params });
  return data;
}

/** GET /reports/reminders — installments due soon (today/tomorrow) and overdue. */
export async function getReminders(params: { planId?: number } = {}): Promise<RemindersReport> {
  const { data } = await api.get<ApiSuccess<RemindersReport>>("/reports/reminders", { params });
  return data.data;
}
