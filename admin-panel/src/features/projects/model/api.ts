import { api } from "@/shared/http";
import type { PaginatedProjects, ProjectStatus } from "./types";

export interface AdminProjectsParams {
    status?: ProjectStatus;
    search?: string;
    page: number;
    limit: number;
}

export const findProjects = async (params: AdminProjectsParams) => {
    return (await api.get<PaginatedProjects>("/projects/admin", { params })).data;
};

export const deleteProject = async (id: string) => {
    return (await api.delete(`/projects/${id}`)).data;
};

export const setFeatured = async ({ id, isFeatured }: { id: string; isFeatured: boolean }) => {
    return (await api.patch(`/projects/${id}/featured`, { isFeatured })).data;
};

export const closeProject = async (id: string) => {
    return (await api.patch(`/projects/${id}/closed`)).data;
};
