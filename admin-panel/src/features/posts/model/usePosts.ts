import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createPost,
    deletePost,
    getAllPosts,
    getLatestPosts,
    getPost,
    searchPosts,
    updatePost,
} from "./api";


export const postKeys = {
    all: (page: number, limit: number) => [
        "posts",
        page,
        limit,
    ],

    one: (id: string) => [
        "post",
        id,
    ],

    latest: [
        "latest-posts",
    ],

    search: (searchTerm: string) => [
        "posts-search",
        searchTerm,
    ],
};


export const usePost = (id?: string) => {
    const queryClient = useQueryClient();
    const updateMutation = useMutation({
        mutationFn: ({
            id,
            formData,
        }: {
            id: string;
            formData: FormData;
        }) => updatePost(id, formData),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["posts"],
            });
        },
    });


    const deleteMutation = useMutation({
        mutationFn: (id: string) => deletePost(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["posts"],
            });
        },
    });


    const {
        data: post,
        isLoading: isLoadingPost,
    } = useQuery({
        queryFn: () => getPost(id!),
        queryKey: postKeys.one(id!),
        enabled: !!id,
    });


    return {
        post,
        isLoadingPost,

        updateMutation,
        deleteMutation,
    };
};



export const usePostList = (
    page: number = 1,
    limit: number = 10,
) => {
    return useQuery({
        queryFn: () => getAllPosts(page, limit),
        queryKey: postKeys.all(page, limit),
    });
};



export const useLatestPosts = () => {
    return useQuery({
        queryFn: getLatestPosts,
        queryKey: postKeys.latest,
    });
};



export const useSearchPosts = (
    searchTerm: string,
) => {
    return useQuery({
        queryFn: () => searchPosts(searchTerm),
        queryKey: postKeys.search(searchTerm),
        enabled: !!searchTerm.trim(),
    });
};



export const useCreatePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (formData: FormData) => createPost(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["posts"],
            });
        },
    });
};