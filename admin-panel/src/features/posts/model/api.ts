import { api } from "@/shared/http";

export const createPost = async (formData: FormData) => {
    const res = await api.post("/posts", formData);
    return res.data;
};

export const getAllPosts = async (
    page: number = 1,
    limit: number = 10,
) => {
    const res = await api.get("/posts", {
        params: {
            page,
            limit,
        },
    });

    return res.data;
};


export const getPost = async (id: string) => {
    if (!id) return;

    const res = await api.get(`/posts/${id}`);

    return res.data;
};


export const updatePost = async (
    id: string,
    formData: FormData
) => {
    const res = await api.put(`/posts/${id}`, formData);

    return res.data;
};


export const deletePost = async (id: string) => {
    const res = await api.delete(`/posts/${id}`);

    return res.data;
};


export const getLatestPosts = async () => {
    const res = await api.get("/posts/latest");

    return res.data;
};


export const searchPosts = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.trim() === "") {
        return [];
    }

    const res = await api.get("/posts/search", {
        params: {
            searchTerm,
        },
    });

    return res.data;
};