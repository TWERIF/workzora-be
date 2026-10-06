import { useQuery } from "@tanstack/react-query";
import { getStatsOverview } from "./api";

export const useStatsOverview = (days: number) =>
    useQuery({
        queryKey: ["stats", "overview", days],
        queryFn: () => getStatsOverview(days),
        placeholderData: (previousData) => previousData,
        retry: false,
    });
