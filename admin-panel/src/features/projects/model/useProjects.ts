import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { closeProject, deleteProject, findProjects, setFeatured, type AdminProjectsParams } from "./api";

export const PROJECT_KEYS = {
    all: ["admin-projects"] as const,
    list: (params: AdminProjectsParams) => [...PROJECT_KEYS.all, params] as const,
};

export const useAdminProjects = (params: AdminProjectsParams) =>
    useQuery({
        queryKey: PROJECT_KEYS.list(params),
        queryFn: () => findProjects(params),
        placeholderData: (previousData) => previousData,
        retry: false,
    });

const useInvalidateProjects = () => {
    const queryClient = useQueryClient();
    return () => queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.all });
};

export const useDeleteProject = () => {
    const invalidate = useInvalidateProjects();
    return useMutation({ mutationFn: deleteProject, onSuccess: invalidate });
};

export const useSetFeatured = () => {
    const invalidate = useInvalidateProjects();
    return useMutation({ mutationFn: setFeatured, onSuccess: invalidate });
};

export const useCloseProject = () => {
    const invalidate = useInvalidateProjects();
    return useMutation({ mutationFn: closeProject, onSuccess: invalidate });
};
