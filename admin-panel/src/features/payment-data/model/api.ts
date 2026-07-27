import { api } from "@/shared/http";

export const findMany = async ({ page = 1, limit = 10 }: { page: number; limit: number }) => {
    return (await api.get("/payment-data/get-many", {
        params: {
            page,
            limit
        }
    })).data;
}

export const findOne = async (id: string) => {
    return (await api.get(`/payment-data/get-one/${id}`)).data;
}

export const toCompleted = async (data: { id: string; }) => {
    const res = await api.patch(`/projects/${data.id}/closed`);
    return res.data;
};