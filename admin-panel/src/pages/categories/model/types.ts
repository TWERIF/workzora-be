import type { Category } from "@/features/categories/category/model/types";

export interface CategoryState {
    category: Category | null;
    setCategory: (category: Category) => void;
    reset: () => void;
}