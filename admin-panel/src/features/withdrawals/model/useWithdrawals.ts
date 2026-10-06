import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { complete, findMany, findOne, reject } from './api';
import type { WithdrawalStatus } from './types';

export const WITHDRAWAL_KEYS = {
    all: ['withdrawals'] as const,
    lists: () => [...WITHDRAWAL_KEYS.all, 'list'] as const,
    list: (params: { status?: WithdrawalStatus; page: number; limit: number }) => [...WITHDRAWAL_KEYS.lists(), params] as const,
    detail: (id: string) => [...WITHDRAWAL_KEYS.all, 'detail', id] as const,
};

export const useWithdrawalList = (params: { status?: WithdrawalStatus; page: number; limit: number }) => {
    return useQuery({
        queryKey: WITHDRAWAL_KEYS.list(params),
        queryFn: () => findMany(params),
        placeholderData: (previousData) => previousData,
        retry: false,
    });
};

export const useWithdrawalDetail = (id: string) => {
    return useQuery({
        queryKey: WITHDRAWAL_KEYS.detail(id),
        queryFn: () => findOne(id),
        enabled: !!id,
        retry: false,
    });
};

const useInvalidateWithdrawals = () => {
    const queryClient = useQueryClient();
    return () => queryClient.invalidateQueries({ queryKey: WITHDRAWAL_KEYS.all });
};

export const useCompleteWithdrawal = () => {
    const invalidate = useInvalidateWithdrawals();
    return useMutation({ mutationFn: complete, onSuccess: invalidate });
};

export const useRejectWithdrawal = () => {
    const invalidate = useInvalidateWithdrawals();
    return useMutation({ mutationFn: reject, onSuccess: invalidate });
};
