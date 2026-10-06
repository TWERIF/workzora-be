
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import {
    Field,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { uploadPostImage } from "@/features/posts/model/api";
import Image from "@tiptap/extension-image";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef, useState } from "react";


interface TipTapEditorProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
}


export default function TipTapEditor({
    value,
    onChange,
    label = "Стаття",
}: TipTapEditorProps) {


    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const editor = useEditor({

        extensions: [
            StarterKit,
            Image.configure({
                HTMLAttributes: { loading: "lazy" },
            }),
        ],

        content: value,

        immediatelyRender: false,

        editorProps: {
            attributes: {
                class: cn(
                    "min-h-[250px]",
                    "p-4",
                    "outline-none",
                    "text-sm",
                    "leading-relaxed",
                    "[&_img]:my-3 [&_img]:max-w-full [&_img]:rounded-lg",
                    "[&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold"
                )
            }
        },


        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        }

    });



    useEffect(() => {

        if (!editor) return;


        if (editor.getHTML() !== value) {

            editor.commands.setContent(
                value || "",
                {
                    emitUpdate: false,
                }
            );

        }

    }, [
        value,
        editor
    ]);



    if (!editor) {
        return null;
    }


    const handleImageSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;

        setUploadError(null);
        setIsUploading(true);
        try {
            const url = await uploadPostImage(file);
            editor.chain().focus().setImage({ src: url, alt: file.name.replace(/\.[^.]+$/, "") }).run();
        } catch {
            setUploadError("Не вдалося завантажити фото");
        } finally {
            setIsUploading(false);
        }
    };



    return (

        <FieldGroup>

            <FieldLabel>
                {label}
            </FieldLabel>


            <Field>

                <Card
                    className="
                    overflow-hidden
                    p-0
                    "
                >


                    <div
                        className="
                        flex
                        flex-wrap
                        gap-2
                        border-b
                        border-border
                        p-3
                        "
                    >


                        <ToolbarButton
                            active={editor.isActive("bold")}
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .toggleBold()
                                    .run()
                            }
                        >
                            B
                        </ToolbarButton>



                        <ToolbarButton
                            active={editor.isActive("italic")}
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .toggleItalic()
                                    .run()
                            }
                        >
                            I
                        </ToolbarButton>



                        <ToolbarButton
                            active={editor.isActive("heading", { level: 2 })}
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .toggleHeading({ level: 2 })
                                    .run()
                            }
                        >
                            H2
                        </ToolbarButton>



                        <ToolbarButton
                            active={editor.isActive("heading", { level: 3 })}
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .toggleHeading({ level: 3 })
                                    .run()
                            }
                        >
                            H3
                        </ToolbarButton>



                        <ToolbarButton
                            disabled={isUploading}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {isUploading ? "Завантаження..." : "Фото"}
                        </ToolbarButton>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageSelected}
                        />



                        <ToolbarButton
                            active={editor.isActive("bulletList")}
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .toggleBulletList()
                                    .run()
                            }
                        >
                            • Список
                        </ToolbarButton>



                        <ToolbarButton
                            active={editor.isActive("orderedList")}
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .toggleOrderedList()
                                    .run()
                            }
                        >
                            1. Список
                        </ToolbarButton>



                        <ToolbarButton
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .undo()
                                    .run()
                            }
                        >
                            Назад
                        </ToolbarButton>



                        <ToolbarButton
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .redo()
                                    .run()
                            }
                        >
                            Вперед
                        </ToolbarButton>


                    </div>

                    {uploadError && (
                        <p className="px-3 pt-2 text-sm text-destructive">
                            {uploadError}
                        </p>
                    )}



                    <CardContent
                        className="
                        p-0
                        "
                    >

                        <EditorContent
                            editor={editor}
                        />

                    </CardContent>


                </Card>

            </Field>

        </FieldGroup>

    );
}



function ToolbarButton({
    children,
    onClick,
    active = false,
    disabled = false
}: {
    children: React.ReactNode;
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
}) {

    return (

        <button
            type="button"
            onClick={onClick}
            disabled={disabled}

            className={`
                rounded
                border
                px-3
                py-1
                text-sm
                disabled:opacity-50

                ${active
                    ?
                    "bg-primary text-primary-foreground"
                    :
                    "border-border"
                }

            `}
        >

            {children}

        </button>

    );

}