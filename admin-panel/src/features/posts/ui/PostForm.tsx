import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";

import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel
} from "@/components/ui/field";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import TipTapEditor from "@/shared/components/TipTapEditor";
import { useParams } from "react-router-dom";
import type { CreatePostDto } from "../model/types";
import { useCreatePost, usePost } from "../model/usePosts";

export default function PostForm() {
    const { id: postId } = useParams<{ id: string }>();
    const isEditMode = !!postId;

    const { mutateAsync: createPost } = useCreatePost();
    const { post, updateMutation, isLoadingPost } = usePost(postId);

    const form = useForm({
        defaultValues: {
            title: post?.title || "",
            teaser: post?.teaser || "",
            imageUrl: null,
            article: post?.article || "",
            tag: post?.tag || ""
        } as CreatePostDto,

        onSubmit: async ({ value }) => {
            try {
                const formData = new FormData();

                formData.append("title", value.title);
                formData.append("tag", value.tag);
                formData.append("teaser", value.teaser);
                formData.append("article", value.article);

                if (value.imageUrl) {
                    formData.append("imageUrl", value.imageUrl);
                }

                if (isEditMode) {
                    await updateMutation.mutateAsync({
                        id: postId,
                        formData
                    });
                    toast.success("Пост успішно оновлено!");
                } else {
                    await createPost(formData);
                    toast.success("Пост створено успішно!");
                    form.reset();
                }
            } catch {
                toast.error(
                    isEditMode
                        ? "Не вдалося оновити пост"
                        : "Не вдалося створити пост"
                );
            }
        }
    });

    if (isEditMode && isLoadingPost) {
        return <div className="text-center mt-10">Завантаження...</div>;
    }

    return (
        <Card className="max-w-4xl mx-auto mt-10 p-5">
            <CardHeader>
                <CardTitle>
                    {isEditMode ? "Редагувати пост" : "Створити пост"}
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
                    <form.Field name="imageUrl">
                        {(field) => {
                            const selectedFile = field.state.value;

                            return (
                                <FieldGroup>
                                    <FieldLabel>Зображення (завантажте нове, щоб замінити)</FieldLabel>
                                    <Field>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onBlur={field.handleBlur}
                                            onChange={(e) =>
                                                field.handleChange(
                                                    e.target.files?.[0] ?? null
                                                )
                                            }
                                        />
                                    </Field>

                                    {selectedFile && (
                                        <div className="mt-3 flex flex-col gap-2">
                                            <img
                                                src={URL.createObjectURL(selectedFile)}
                                                alt="Preview"
                                                className="max-h-48 w-auto rounded-md object-cover border shadow-sm"
                                            />
                                            <p className="text-sm text-muted-foreground">
                                                {selectedFile.name}
                                            </p>
                                        </div>
                                    )}

                                    {!selectedFile && post?.imageUrl && (
                                        <div className="mt-3 flex flex-col gap-2">
                                            <img
                                                src={post.imageUrl}
                                                alt="Current post image"
                                                className="max-h-48 w-auto rounded-md object-cover border shadow-sm opacity-70"
                                            />
                                            <p className="text-sm text-muted-foreground">
                                                Поточне зображення
                                            </p>
                                        </div>
                                    )}

                                    {field.state.meta.errors.length > 0 && (
                                        <FieldError>
                                            {field.state.meta.errors.join(", ")}
                                        </FieldError>
                                    )}
                                </FieldGroup>
                            );
                        }}
                    </form.Field>

                    {["title", "tag"].map((fieldName) => (
                        <form.Field
                            key={fieldName}
                            name={fieldName as keyof CreatePostDto}
                        >
                            {(field) => (
                                <FieldGroup>
                                    <FieldLabel>
                                        {fieldName === "title" ? "Заголовок" : "Тег"}
                                    </FieldLabel>

                                    <Field>
                                        <Input
                                            value={field.state.value as string}
                                            onBlur={field.handleBlur}
                                            onChange={(e) =>
                                                field.handleChange(e.target.value)
                                            }
                                        />
                                    </Field>

                                    {field.state.meta.errors.length > 0 && (
                                        <FieldError>
                                            {field.state.meta.errors.join(", ")}
                                        </FieldError>
                                    )}
                                </FieldGroup>
                            )}
                        </form.Field>
                    ))}

                    <form.Field name="teaser">
                        {(field) => (
                            <TipTapEditor
                                label="teaser"
                                value={field.state.value as string}
                                onChange={(value) => field.handleChange(value)}
                            />
                        )}
                    </form.Field>

                    <form.Field name="article">
                        {(field) => (
                            <TipTapEditor
                                value={field.state.value as string}
                                onChange={(value) => field.handleChange(value)}
                            />
                        )}
                    </form.Field>
                </CardContent>

                <CardFooter className="flex justify-end">
                    <form.Subscribe
                        selector={(state) => [
                            state.canSubmit,
                            state.isSubmitting
                        ]}
                    >
                        {([canSubmit, isSubmitting]) => (
                            <Button
                                type="submit"
                                disabled={!canSubmit || isSubmitting}
                            >
                                {isSubmitting
                                    ? "Збереження..."
                                    : isEditMode
                                        ? "Оновити"
                                        : "Створити"}
                            </Button>
                        )}
                    </form.Subscribe>
                </CardFooter>
            </form>
        </Card>
    );
}