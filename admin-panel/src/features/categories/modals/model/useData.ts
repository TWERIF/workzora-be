import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { create, deleteOne, findAll, findOne, update } from './http';
import type { CreateCategoriesDto } from './types';

export const CATEGORY_KEYS = {
    all: ['categories'] as const,
    lists: () => [...CATEGORY_KEYS.all, 'list'] as const,
    list: (params: { page: number; limit: number }) => [...CATEGORY_KEYS.lists(), params] as const,
    details: () => [...CATEGORY_KEYS.all, 'detail'] as const,
    detail: (id: string) => [...CATEGORY_KEYS.details(), id] as const,
};

export const useCategoriesList = (
    params: { page: number; limit: number } = {
        page: 1,
        limit: 20,
    }
) => {
    return useQuery({
        queryKey: CATEGORY_KEYS.list(params),
        queryFn: () => findAll(params),
        placeholderData: (previousData) => previousData,
    });
};

export const useCategoryDetail = (id: string) => {
    return useQuery({
        queryKey: CATEGORY_KEYS.detail(id),
        queryFn: () => findOne(id),
        enabled: !!id,
    });
};

export const useCreateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (body: CreateCategoriesDto) => create(body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.lists() });
        },
    });
};

export const useUpdateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, body }: { id: string; body: Partial<CreateCategoriesDto> }) => update(body, id),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.lists() });
            queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.detail(variables.id) });
        },
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteOne(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.lists() });
        },
    });
};