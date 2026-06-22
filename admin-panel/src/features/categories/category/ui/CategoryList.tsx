import { useCategoryStore } from "@/pages/categories/model/store";
import type { Category } from "../model/types";
import CategoryItem from "./CategoryItem";

interface CategoryListProps {
    items: Category[];
    page: number;
    totalPages: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
}

export default function CategoryList({
    items,
    page,
    totalPages,
    limit,
    total,
    onPageChange,
}: CategoryListProps) {
    const category = useCategoryStore((state) => state.category);
    const setCategory = useCategoryStore((state) => state.setCategory);
    const reset = useCategoryStore((state) => state.reset);

    const update = (item: Category) => {
        if (!category) {
            setCategory(item);
        } else {
            if (category.id === item.id) {
                reset();
            } else{
                setCategory(item);
            }
        }
    }
    return (
        <div className="flex flex-col gap-4 py-[20px]">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Всього: {total}</span>
                <span>
                    Сторінка {page} з {totalPages} (по {limit})
                </span>
            </div>

            <div className="grid gap-4 mt-[40px]">
                {items.length > 0 ? (
                    items.map((item) => (
                        <CategoryItem
                            key={item.id}
                            id={item.id}
                            name={item.title}
                            description={item.description}
                            onClick={() => update(item)}
                        />
                    ))
                ) : (
                    <p className="text-center text-muted-foreground">
                        Категорії відсутні
                    </p>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                    <button
                        disabled={page === 1}
                        onClick={() => onPageChange(page - 1)}
                        className="border rounded px-3 py-1 disabled:opacity-50"
                    >
                        ←
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (pageNumber) => (
                            <button
                                key={pageNumber}
                                onClick={() => onPageChange(pageNumber)}
                                className={`border rounded px-3 py-1 ${pageNumber === page
                                    ? "bg-primary text-primary-foreground"
                                    : ""
                                    }`}
                            >
                                {pageNumber}
                            </button>
                        )
                    )}

                    <button
                        disabled={page === totalPages}
                        onClick={() => onPageChange(page + 1)}
                        className="border rounded px-3 py-1 disabled:opacity-50"
                    >
                        →
                    </button>
                </div>
            )}
        </div>
    );
}