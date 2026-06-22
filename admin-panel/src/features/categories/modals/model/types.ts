import type { Category } from "../../category/model/types";

export interface CategoryFormValues {
  name: string;
  description?: string;
}

export interface CreateCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
}

export interface CreateCategoriesDto {
  title: string;
  description: string;
}
