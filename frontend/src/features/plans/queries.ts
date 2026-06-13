import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as plansApi from "@/api/plans.api";
import { getApiErrorMessage } from "@/api/client";
import { customerKeys } from "@/features/customers/queries";
import type { AssignMemberPayload, PlanListParams, PlanPayload } from "@/types/plan";

export const planKeys = {
  all: ["plans"] as const,
  lists: () => [...planKeys.all, "list"] as const,
  list: (params: PlanListParams) => [...planKeys.lists(), params] as const,
  detail: (id: number) => [...planKeys.all, "detail", id] as const,
  members: (id: number) => [...planKeys.all, "members", id] as const,
};

export function usePlans(params: PlanListParams) {
  return useQuery({
    queryKey: planKeys.list(params),
    queryFn: () => plansApi.listPlans(params),
    placeholderData: keepPreviousData,
  });
}

export function usePlan(id: number) {
  return useQuery({
    queryKey: planKeys.detail(id),
    queryFn: () => plansApi.getPlan(id),
    enabled: Number.isInteger(id) && id > 0,
  });
}

/** Lightweight {id, name} plan list for filter dropdowns. */
export function usePlanOptions() {
  return useQuery({
    queryKey: [...planKeys.all, "options"],
    queryFn: async () => {
      const res = await plansApi.listPlans({ limit: 100, sortBy: "name", sortOrder: "asc" });
      return res.data.map((plan) => ({ id: plan.id, name: plan.name }));
    },
    staleTime: 60_000,
  });
}

export function usePlanMembers(id: number) {
  return useQuery({
    queryKey: planKeys.members(id),
    queryFn: () => plansApi.listPlanMembers(id),
    enabled: Number.isInteger(id) && id > 0,
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PlanPayload) => plansApi.createPlan(payload),
    onSuccess: (plan) => {
      queryClient.invalidateQueries({ queryKey: planKeys.all });
      toast.success(`Plan "${plan.name}" created`);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Failed to create plan")),
  });
}

export function useAssignMember(planId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssignMemberPayload) => plansApi.assignMember(planId, payload),
    onSuccess: (result) => {
      // Member list + capacity changed; the customer's membership count too.
      queryClient.invalidateQueries({ queryKey: planKeys.all });
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
      toast.success(`Customer assigned (ticket #${result.ticketNumber ?? "—"})`);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Failed to assign customer")),
  });
}
