import { keepPreviousData, useQuery } from "@tanstack/react-query";
import * as reportsApi from "@/api/reports.api";
import type { CollectionsReportParams, PendingReportParams } from "@/types/report";

export const reportKeys = {
  all: ["reports"] as const,
  summary: () => [...reportKeys.all, "summary"] as const,
  collections: (params: CollectionsReportParams) =>
    [...reportKeys.all, "collections", params] as const,
  pending: (params: PendingReportParams) => [...reportKeys.all, "pending", params] as const,
};

export function useReportSummary() {
  return useQuery({
    queryKey: reportKeys.summary(),
    queryFn: reportsApi.getSummary,
    staleTime: 30_000,
  });
}

export function useCollectionsReport(params: CollectionsReportParams) {
  return useQuery({
    queryKey: reportKeys.collections(params),
    queryFn: () => reportsApi.getCollectionsReport(params),
    placeholderData: keepPreviousData,
  });
}

export function usePendingReport(params: PendingReportParams) {
  return useQuery({
    queryKey: reportKeys.pending(params),
    queryFn: () => reportsApi.getPendingReport(params),
    placeholderData: keepPreviousData,
  });
}
