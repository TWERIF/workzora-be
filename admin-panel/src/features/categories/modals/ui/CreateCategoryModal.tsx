import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { categorySchema } from "../model/schema";
import type { CategoryFormValues, CreateCategoryModalProps } from "../model/types";
import { useCategoryTree, useCreateCategory, useUpdateCategory } from "../model/useData";



export default function CreateCategoryModal({ open, onOpenChange, category }: CreateCategoryModalProps) {
    const { mutateAsync: createCategory } = useCreateCategory();
    const { mutateAsync: updateCategory } = useUpdateCategory();
    const { data: tree = [] } = useCategoryTree();
    const parents = tree.filter((node) => node.id !== category?.id);

    const isEdit = !!category;

    useEffect(() => {
        if (category) {
            form.setFieldValue("name", category.title);
            form.setFieldValue("description", category.description ?? "");
            form.setFieldValue("parentId", category.parentId ?? "");
        } else {
            form.reset();
        }
    }, [category, open]);

    const form = useForm({
        defaultValues: {
            name: "",
            description: "",
            parentId: "",
        } as CategoryFormValues,

        onSubmit: async ({ value }) => {
            try {
                if (isEdit && category) {
                    await updateCategory({
                        id: category.id,
                        body: {
                            title: value.name,
                            description: value.description ?? "",
                            parentId: value.parentId || null,
                        },
                    });

                    toast.success("Категорію оновлено успішно!");
                } else {
                    await createCategory({
                        title: value.name,
                        description: value.description ?? "",
                        ...(value.parentId ? { parentId: value.parentId } : {}),
                    });

                    toast.success("Категорію створено успішно!");
                }

                onOpenChange(false);
                form.reset();
            } catch {
                toast.error(
                    isEdit
                        ? "Не вдалося оновити категорію."
                        : "Не вдалося створити категорію."
                );
            }
        },
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[425px] p-0 border-none" showCloseButton={false}>
                <Card className="p-[10px]">
                    <CardHeader>
                        <CardTitle>
                            {isEdit ? "Редагувати категорію" : "Створити нову категорію"}
                        </CardTitle>
                    </CardHeader>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            form.handleSubmit();
                        }}
                    >
                        <CardContent className="space-y-4">
                            <form.Field
                                name="name"
                                validators={{
                                    onChange: ({ value }) => {
                                        const result = categorySchema.shape.name.safeParse(value);
                                        if (!result.success) {
                                            return result.error.errors[0]?.message;
                                        }
                                    },
                                }}
                            >
                                {(field) => (
                                    <FieldGroup>
                                        <FieldLabel htmlFor={field.name}>Назва категорії</FieldLabel>
                                        <Field>
                                            <Input
                                                id={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                            />
                                        </Field>
                                        {field.state.meta.errors.length > 0 && (
                                            <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                                        )}
                                    </FieldGroup>
                                )}
                            </form.Field>

                            <form.Field
                                name="description"
                                validators={{
                                    onChange: ({ value }) => {
                                        const result = categorySchema.shape.description.safeParse(value);
                                        if (!result.success) {
                                            return result.error.errors[0]?.message;
                                        }
                                    },
                                }}
                            >
                                {(field) => (
                                    <FieldGroup>
                                        <FieldLabel htmlFor={field.name}>Опис</FieldLabel>
                                        <Field>
                                            <Input
                                                id={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                            />
                                        </Field>
                                    </FieldGroup>
                                )}
                            </form.Field>
                            <form.Field name="parentId">
                                {(field) => (
                                    <FieldGroup>
                                        <FieldLabel htmlFor={field.name}>Батьківська категорія (для спеціалізації)</FieldLabel>
                                        <Field>
                                            <select
                                                id={field.name}
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                                            >
                                                <option value="">Немає, це основна категорія</option>
                                                {parents.map((node) => (
                                                    <option key={node.id} value={node.id}>
                                                        {node.title}
                                                    </option>
                                                ))}
                                            </select>
                                        </Field>
                                    </FieldGroup>
                                )}
                            </form.Field>
                        </CardContent>

                        <CardFooter className="flex justify-end gap-2 mt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Скасувати
                            </Button>

                            <form.Subscribe
                                selector={(state) => [state.canSubmit, state.isSubmitting]}
                            >
                                {([canSubmit, isSubmitting]) => (
                                    <Button type="submit" disabled={!canSubmit || isSubmitting}>
                                        {isSubmitting
                                            ? "Збереження..."
                                            : isEdit
                                                ? "Оновити"
                                                : "Створити"}
                                    </Button>
                                )}
                            </form.Subscribe>
                        </CardFooter>
                    </form>
                </Card>
            </DialogContent>
        </Dialog>
    );

}