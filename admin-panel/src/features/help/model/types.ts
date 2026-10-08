export const HELP_CATEGORIES = [
    { value: "getting-started", label: "Початок роботи" },
    { value: "for-clients", label: "Для клієнтів" },
    { value: "for-freelancers", label: "Для фрилансерів" },
    { value: "payments-escrow", label: "Оплата й ескроу" },
    { value: "projects-proposals", label: "Проєкти й пропозиції" },
    { value: "account-settings", label: "Акаунт і налаштування" },
    { value: "safety-arbitration", label: "Безпека й арбітраж" },
    { value: "technical-support", label: "Технічна підтримка" },
] as const;

export const HELP_LOCALES = [
    { value: "uk", label: "Українська" },
    { value: "en", label: "Англійська" },
] as const;

export const categoryLabel = (value: string) => HELP_CATEGORIES.find((item) => item.value === value)?.label ?? value;

export interface HelpArticle {
    id: string;
    category: string;
    slug: string;
    locale: string;
    title: string;
    summary: string;
    body: string;
    position: number;
    minutesToRead: number;
    helpfulYes: number;
    helpfulMaybe: number;
    helpfulNo: number;
    updatedAt: string;
}

export type HelpArticleInput = Pick<HelpArticle, "category" | "slug" | "locale" | "title" | "summary" | "body" | "position">;

export interface HelpAdminQuery {
    page: number;
    limit: number;
    category?: string;
    locale?: string;
    search?: string;
}

export interface HelpAdminPage {
    data: HelpArticle[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
