import { api } from "@/shared/http";
import type { PaginatedResponse, Withdrawal, WithdrawalDetails, WithdrawalStatus } from "./types";

export const findMany = async (params: { status?: WithdrawalStatus; page: number; limit: number }) => {
    return (await api.get<PaginatedResponse<Withdrawal>>("/wallet/admin/withdrawals", { params })).data;
};

export const findOne = async (id: string) => {
    return (await api.get<WithdrawalDetails>(`/wallet/admin/withdrawals/${id}`)).data;
};

export const complete = async (id: string) => {
    return (await api.patch<Withdrawal>(`/wallet/admin/withdrawals/${id}/complete`)).data;
};

export const reject = async ({ id, note }: { id: string; note?: string }) => {
    return (await api.patch<Withdrawal>(`/wallet/admin/withdrawals/${id}/reject`, { note })).data;
};
