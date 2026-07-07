import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { Post } from "../model/types";

interface Props {
    post: Post;
    onClick: () => void;
    onDelete: () => void;
}

export default function PostItem({ post, onClick, onDelete }: Props) {
    return (
        <Card
            className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow flex flex-col h-full"
            onClick={onClick}
        >
            {post.imageUrl && (
                <div className="relative w-full h-48 overflow-hidden bg-muted border-b">
                    <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        loading="lazy"
                    />
                </div>
            )}

            <CardHeader className="p-4 space-y-2 flex-1">
                <CardTitle className="line-clamp-2 text-xl">
                    {post.title}
                </CardTitle>

                <div
                    className="text-sm text-muted-foreground line-clamp-3 prose prose-sm dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: post.teaser }}
                />
            </CardHeader>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
                className="text-red-500 cursor-pointer"
            >
                Видалити
            </button>
        </Card>
    );
}