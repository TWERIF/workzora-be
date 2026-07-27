const CURRENCY_MAP: Record<number, string> = {
    840: "USD",
    978: "EUR",
    980: "UAH",
    826: "GBP",
    985: "PLN",
    756: "CHF",
    124: "CAD",
    392: "JPY",
    156: "CNY",
};

export function getCurrencyAlpha(currencyCode: number): string {
    return CURRENCY_MAP[currencyCode] ?? "USD";
}

export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "—";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
}

export function formatMoney(amount: number | string, currencyCode: number, locale = "uk-UA"): string {
    const value = (typeof amount === "string" ? parseInt(amount) : amount)/100;
    const currency = getCurrencyAlpha(currencyCode);

    try {
        return new Intl.NumberFormat(locale, {
            style: "currency",
            currency,
            minimumFractionDigits: 2,
        }).format(value);
    } catch {
        return `${value.toFixed(2)} ${currency}`;
    }
}

export function formatNumber(value: number | string, locale = "uk-UA"): string {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (Number.isNaN(num)) return "—";

    return new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(num);
}
export function formatCardNumber(card: string): string {
    return card.replace(/(.{4})/g, "$1 ").trim();
}

export function getPaginationRange(current: number, total: number, siblings = 1): (number | "ellipsis")[] {
    const totalNumbers = siblings * 2 + 5;

    if (total <= totalNumbers) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const leftSibling = Math.max(current - siblings, 1);
    const rightSibling = Math.min(current + siblings, total);

    const showLeftEllipsis = leftSibling > 2;
    const showRightEllipsis = rightSibling < total - 1;

    const range: (number | "ellipsis")[] = [1];

    if (showLeftEllipsis) range.push("ellipsis");

    for (let i = leftSibling; i <= rightSibling; i++) {
        if (i !== 1 && i !== total) range.push(i);
    }

    if (showRightEllipsis) range.push("ellipsis");

    range.push(total);

    return range;
}