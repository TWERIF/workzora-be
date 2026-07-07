import { useNavigate } from "react-router-dom";
import type { Post } from "../model/types";
import PostItem from "./PostItem";


interface Props {
    items: Post[];
    page: number;
    totalPages: number;
    total: number;
    onPageChange: (page: number) => void;
    onDelete: (id: string) => void;
}


export default function PostList({
    items,
    page,
    totalPages,
    total,
    onPageChange,
    onDelete
}: Props) {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col gap-4 py-5">


            <div className="flex justify-between text-sm text-muted-foreground">

                <span>
                    Всього: {total}
                </span>

                <span>
                    Сторінка {page} з {totalPages}
                </span>

            </div>


            <div className="grid gap-4 mt-5">

                {
                    items.length ?

                        items.map(post => (
                            <PostItem
                                key={post.id}
                                post={post}
                                onClick={() => navigate(`/posts/create/${post.id}`)}
                                onDelete={() => onDelete(post.id)}
                            />
                        ))

                        :

                        <p className="text-center text-muted-foreground">
                            Пости відсутні
                        </p>

                }

            </div>



            {
                totalPages > 1 &&

                <div className="flex justify-center gap-2">

                    <button
                        disabled={page === 1}
                        onClick={() => onPageChange(page - 1)}
                        className="border px-3 py-1 rounded"
                    >
                        ←
                    </button>


                    {
                        Array.from({
                            length: totalPages
                        }, (_, i) => i + 1)
                            .map(number => (

                                <button
                                    key={number}
                                    onClick={() => onPageChange(number)}
                                    className={`border px-3 py-1 rounded ${page === number ? "bg-primary text-white" : ""
                                        }`}
                                >
                                    {number}
                                </button>

                            ))
                    }


                    <button
                        disabled={page === totalPages}
                        onClick={() => onPageChange(page + 1)}
                        className="border px-3 py-1 rounded"
                    >
                        →
                    </button>


                </div>
            }


        </div>
    )

}