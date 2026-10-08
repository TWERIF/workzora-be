import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHelpArticle, useSaveHelpArticle } from "@/features/help/model/useHelp";
import { HELP_CATEGORIES, HELP_LOCALES, type HelpArticleInput } from "@/features/help/model/types";
import TipTapEditor from "@/shared/components/TipTapEditor";
import { isAxiosError } from "axios";
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const EMPTY: HelpArticleInput = { category: HELP_CATEGORIES[0].value, locale: "uk", slug: "", title: "", summary: "", body: "", position: 0 };
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const selectClass = "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm";

const errorText = (error: unknown) =>
    isAxiosError<{ message?: string | string[] }>(error) ? [error.response?.data?.message].flat().filter(Boolean).join(", ") || "Помилка запиту" : "Помилка запиту";

const Label = ({ htmlFor, children }: { htmlFor: string; children: string }) => (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
        {children}
    </label>
);

export default function HelpArticleForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: article } = useHelpArticle(id);
    const save = useSaveHelpArticle();
    const [form, setForm] = useState<HelpArticleInput>(EMPTY);

    useEffect(() => {
        if (article) {
            const { category, locale, slug, title, summary, body, position } = article;
            setForm({ category, locale, slug, title, summary, body, position });
        }
    }, [article]);

    const set = <K extends keyof HelpArticleInput>(key: K, value: HelpArticleInput[K]) => setForm((current) => ({ ...current, [key]: value }));

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        if (!SLUG_RE.test(form.slug)) {
            toast.error("Slug: лише латинські літери в нижньому регістрі, цифри й дефіси");
            return;
        }
        if (!form.body.replace(/<[^>]*>/g, "").trim()) {
            toast.error("Додайте текст статті");
            return;
        }
        try {
            await save.mutateAsync({ id, body: { ...form, position: Number(form.position) || 0 } });
            toast.success(id ? "Статтю оновлено" : "Статтю створено");
            navigate("/help");
        } catch (error) {
            toast.error(errorText(error));
        }
    };

    return (
        <form onSubmit={submit} className="mx-auto mt-10 flex max-w-4xl flex-col gap-5 px-4 py-8">
            <h1 className="text-2xl font-semibold">{id ? "Редагувати статтю" : "Нова стаття довідки"}</h1>

            <div className="grid gap-4 sm:grid-cols-3">
                <div>
                    <Label htmlFor="help-category">Розділ</Label>
                    <select id="help-category" value={form.category} onChange={(event) => set("category", event.target.value)} className={selectClass}>
                        {HELP_CATEGORIES.map((item) => (
                            <option key={item.value} value={item.value}>{item.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <Label htmlFor="help-locale">Мова</Label>
                    <select id="help-locale" value={form.locale} onChange={(event) => set("locale", event.target.value)} className={selectClass}>
                        {HELP_LOCALES.map((item) => (
                            <option key={item.value} value={item.value}>{item.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <Label htmlFor="help-position">Порядок у розділі</Label>
                    <Input id="help-position" type="number" min={0} max={1000} value={form.position} onChange={(event) => set("position", Number(event.target.value))} />
                </div>
            </div>

            <div>
                <Label htmlFor="help-title">Заголовок</Label>
                <Input id="help-title" required minLength={3} maxLength={200} value={form.title} onChange={(event) => set("title", event.target.value)} />
            </div>

            <div>
                <Label htmlFor="help-slug">Slug (адреса; однаковий для перекладів)</Label>
                <Input id="help-slug" required maxLength={120} placeholder="how-to-create-account" value={form.slug} onChange={(event) => set("slug", event.target.value.toLowerCase())} />
            </div>

            <div>
                <Label htmlFor="help-summary">Короткий опис</Label>
                <Input id="help-summary" maxLength={400} value={form.summary} onChange={(event) => set("summary", event.target.value)} />
            </div>

            <TipTapEditor label="Текст статті" value={form.body} onChange={(value) => set("body", value)} />

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => navigate("/help")}>
                    Скасувати
                </Button>
                <Button type="submit" disabled={save.isPending}>
                    {save.isPending ? "Збереження..." : "Зберегти"}
                </Button>
            </div>
        </form>
    );
}
