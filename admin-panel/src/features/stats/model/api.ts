import { api } from "@/shared/http";
import type { StatsOverview } from "./types";

export const getStatsOverview = async (days: number): Promise<StatsOverview> => {
    const res = await api.get<StatsOverview>("/stats/overview", { params: { days } });
    return res.data;
};
