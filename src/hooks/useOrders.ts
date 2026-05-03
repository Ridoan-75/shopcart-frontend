import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { getOrders, getOrder } from "@/services/order.service";

export function useOrders(filters: { page?: number; status?: string } = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.ORDERS, filters],
    queryFn: () => getOrders(filters),
    staleTime: 1000 * 60 * 2,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.ORDER(id),
    queryFn: () => getOrder(id),
    enabled: !!id,
  });
}