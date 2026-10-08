import { api } from "@/shared/http";
import type { HelpAdminPage, HelpAdminQuery, HelpArticle, HelpArticleInput } from "./types";

export const findHelpArticles = async (params: HelpAdminQuery) =>
    (await api.get<HelpAdminPage>("/help/admin/articles", { params })).data;

export const getHelpArticle = async (id: string) => (await api.get<HelpArticle>(`/help/admin/articles/${id}`)).data;

export const createHelpArticle = async (body: HelpArticleInput) => (await api.post<HelpArticle>("/help/admin/articles", body)).data;

export const updateHelpArticle = async ({ id, body }: { id: string; body: HelpArticleInput }) =>
    (await api.put<HelpArticle>(`/help/admin/articles/${id}`, body)).data;

export const deleteHelpArticle = async (id: string) => (await api.delete(`/help/admin/articles/${id}`)).data;
