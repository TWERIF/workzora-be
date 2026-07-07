
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
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";


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


    const editor = useEditor({

        extensions: [
            StarterKit,
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
                    "leading-relaxed"
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
    active = false
}: {
    children: React.ReactNode;
    onClick: () => void;
    active?: boolean;
}) {

    return (

        <button
            type="button"
            onClick={onClick}

            className={`
                rounded
                border
                px-3
                py-1
                text-sm

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