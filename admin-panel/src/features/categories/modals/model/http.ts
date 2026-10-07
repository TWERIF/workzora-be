import { api } from "@/shared/http";
import type { CreateCategoriesDto } from "./types";

export const create = async (body: CreateCategoriesDto) => {
    return (await api.post("/categories", body)).data;
}

export const update = async (body: Partial<CreateCategoriesDto>, id: string) => {
    return (await api.patch(`/categories/${id}`, body)).data;
}

export const findAll = async ({ page = 1, limit = 20, search = "" }: { page: number, limit: number, search?: string }) => {
    const term = search.trim();
    return (await api.get(term ? "/categories/search" : "/categories", {
        params: term ? { page, limit, search: term } : { page, limit }
    })).data;
}

export const findOne = async (id: string) => {
    return (await api.get(`/categories/${id}`)).data;
}

export const deleteOne = async (id: string) => {
    return (await api.delete(`/categories/${id}`)).data;
}