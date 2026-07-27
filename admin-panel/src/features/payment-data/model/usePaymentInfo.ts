import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { findMany, findOne, toCompleted } from './api';

export const PAYMENT_DATA_KEYS = {
    all: ['payment-data'] as const,
    lists: () => [...PAYMENT_DATA_KEYS.all, 'list'] as const,
    list: (params: { page: number; limit: number }) => [...PAYMENT_DATA_KEYS.lists(), params] as const,
    details: () => [...PAYMENT_DATA_KEYS.all, 'detail'] as const,
    detail: (id: string) => [...PAYMENT_DATA_KEYS.details(), id] as const,
};

export const usePaymentDataList = (
    params: { page: number; limit: number } = {
        page: 1,
        limit: 10,
    }
) => {
    return useQuery({
        queryKey: PAYMENT_DATA_KEYS.list(params),
        queryFn: () => findMany(params),
        placeholderData: (previousData) => previousData,
        retry: false
    });
};

export const usePaymentDataDetail = (id: string) => {
    return useQuery({
        queryKey: PAYMENT_DATA_KEYS.detail(id),
        queryFn: () => findOne(id),
        enabled: !!id,
        retry: false
    });
};

export const useToCompleted = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { id: string }) => toCompleted(data),
        onSuccess: (_result, variables) => {
            queryClient.invalidateQueries({ queryKey: PAYMENT_DATA_KEYS.lists() });
            queryClient.invalidateQueries({ queryKey: PAYMENT_DATA_KEYS.detail(variables.id) });
        },
    });
};