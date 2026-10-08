import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDeleteHelpArticle, useHelpArticles } from "@/features/help/model/useHelp";
import { categoryLabel, HELP_CATEGORIES, HELP_LOCALES } from "@/features/help/model/types";
import DeleteDialog from "@/shared/components/DeleteDialog";
import Pagination from "@/shared/components/Pagination";
import { BookOpen } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LIMIT = 20;
const selectClass = "h-9 rounded-md border border-input bg-transparent px-3 text-sm";

export default function HelpPage() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [category, setCategory] = useState("");
    const [locale, setLocale] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [toDelete, setToDelete] = useState<string | null>(null);

    const { data, isLoading, isFetching } = useHelpArticles({
        page,
        limit: LIMIT,
        ...(category && { category }),
        ...(locale && { locale }),
        ...(search && { search }),
    });
    const deleteMutation = useDeleteHelpArticle();
    const articles = data?.data ?? [];

    const remove = async () => {
        if (toDelete) await deleteMutation.mutateAsync(toDelete);
        setToDelete(null);
    };

    return (
        <div className="mx-auto mt-10 max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">База знань</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Статті довідки. Переклади однієї статті мають однаковий slug і різну мову.
                    </p>
                </div>
                <Button onClick={() => navigate("/help/create")}>Нова стаття</Button>
            </div>

            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    setSearch(searchInput.trim());
                    setPage(1);
                }}
                className="mb-4 flex flex-wrap gap-2"
            >
                <Input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Пошук за назвою" className="w-60" />
                <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }} className={selectClass} aria-label="Розділ">
                    <option value="">Усі розділи</option>
                    {HELP_CATEGORIES.map((item) => (
                        <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                </select>
                <select value={locale} onChange={(event) => { setLocale(event.target.value); setPage(1); }} className={selectClass} aria-label="Мова">
                    <option value="">Усі мови</option>
                    {HELP_LOCALES.map((item) => (
                        <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                </select>
                <Button type="submit" variant="outline">Знайти</Button>
            </form>

            {isLoading ? (
                <p className="text-sm text-muted-foreground">Завантаження...</p>
            ) : articles.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
                    <BookOpen className="h-8 w-8" />
                    <p className="text-sm">Статей не знайдено</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 text-xs text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 font-medium">Стаття</th>
                                <th className="py-3 pr-4 font-medium">Розділ</th>
                                <th className="py-3 pr-4 font-medium">Мова</th>
                                <th className="py-3 pr-4 font-medium">Порядок</th>
                                <th className="py-3 pr-4 font-medium" title="Так / Частково / Ні">Реакції</th>
                                <th className="py-3 pr-4" />
                            </tr>
                        </thead>
                        <tbody>
                            {articles.map((article) => (
                                <tr key={article.id} className="border-b border-border last:border-0">
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-foreground">{article.title}</p>
                                        <p className="text-xs text-muted-foreground">{article.slug}</p>
                                    </td>
                                    <td className="py-3 pr-4">{categoryLabel(article.category)}</td>
                                    <td className="py-3 pr-4 uppercase">{article.locale}</td>
                                    <td className="py-3 pr-4 tabular-nums">{article.position}</td>
                                    <td className="py-3 pr-4 tabular-nums">
                                        {article.helpfulYes} / {article.helpfulMaybe} / {article.helpfulNo}
                                    </td>
                                    <td className="py-3 pr-4">
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="outline" onClick={() => navigate(`/help/${article.id}`)}>
                                                Редагувати
                                            </Button>
                                            <Button size="sm" variant="destructive" disabled={deleteMutation.isPending} onClick={() => setToDelete(article.id)}>
                                                Видалити
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Pagination page={page} totalPages={data?.totalPages ?? 1} disabled={isFetching} onChange={setPage} />
            <DeleteDialog open={Boolean(toDelete)} onOpenChange={(open) => !open && setToDelete(null)} onDelete={remove} />
        </div>
    );
}
