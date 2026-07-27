import CategoryList from "@/features/categories/category/ui/CategoryList";
import { useCategoriesList, useDeleteCategory } from "@/features/categories/modals/model/useData";
import CreateCategoryModal from "@/features/categories/modals/ui/CreateCategoryModal";
import DeleteDialog from "@/shared/components/DeleteDialog";
import Manage from "@/shared/components/manage/ui/Manage";
import { useState } from "react";
import { useCategoryStore } from "../model/store";

export default function CategoriesPage() {
    const category = useCategoryStore((state) => state.category);
    const reset = useCategoryStore((state) => state.reset);

    const { mutateAsync: deleteCategory } = useDeleteCategory();

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);

    const [page, setPage] = useState(1);
    const limit = 20;

    const { data, isLoading } = useCategoriesList({
        page,
        limit,
    });

    const deleteItem = () => {
        if (category) {
            deleteCategory(category.id);
            reset();
            setIsDeleteOpen(false);
        }
    }

    if (isLoading) {
        return <div>Завантаження...</div>;
    }
    return (
        <div className="mt-10 px-4 md:px-[5%] lg:px-[10%] py-4 md:py-[1%]">
            <Manage
                title="Категорії"
                query=""
                onSearch={(s) => console.log(s)}
                onCreate={() => setIsCreateOpen(true)}
                isUpdateSelected={category ? true : false}
                onUpdate={() => setIsUpdateOpen(true)}
                onDelete={() => setIsDeleteOpen(true)}
            />

            {data && (
                <CategoryList
                    items={data.items}
                    page={data.page}
                    totalPages={data.totalPages}
                    limit={data.limit}
                    total={data.total}
                    onPageChange={setPage}
                />
            )}

            {category && <CreateCategoryModal
                open={isUpdateOpen}
                onOpenChange={setIsUpdateOpen}
                category={category}
            />}

            <CreateCategoryModal
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
            />

            {category && <DeleteDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                onDelete={deleteItem}
            />}
        </div>
    );
}