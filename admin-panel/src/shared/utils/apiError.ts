import { isAxiosError } from "axios";

const KNOWN: Record<string, string> = {
    "An article with this slug already exists in this language": "Стаття з таким slug уже є цією мовою",
    "Only an unpaid project can be deleted": "Видалити можна лише неоплачений проєкт",
    "A paid project in progress cannot be closed": "Оплачений проєкт у роботі не можна закрити",
    "Project not found": "Проєкт не знайдено",
    "Help article not found": "Статтю не знайдено",
    "Category not found": "Категорію не знайдено",
};

const BY_STATUS: Record<number, string> = {
    400: "Перевірте введені дані",
    401: "Сесія завершилась. Увійдіть знову",
    403: "Недостатньо прав для цієї дії",
    404: "Не знайдено",
    409: "Такий запис уже існує",
    429: "Забагато запитів. Спробуйте за хвилину",
};

export const apiErrorMessage = (error: unknown) => {
    if (!isAxiosError<{ message?: string | string[] }>(error)) return "Помилка запиту";
    const messages = [error.response?.data?.message].flat().filter((item): item is string => Boolean(item));
    const known = messages.map((message) => KNOWN[message]).filter(Boolean);
    if (known.length) return known.join(". ");
    return BY_STATUS[error.response?.status ?? 0] ?? "Помилка запиту";
};
