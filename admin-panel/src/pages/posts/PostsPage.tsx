import { usePost, usePostList, useSearchPosts } from "@/features/posts/model/usePosts";
import PostList from "@/features/posts/ui/PostList";
import Manage from "@/shared/components/manage/ui/Manage";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PostsPage() {
    const navigate = useNavigate();

    const [page, setPage] = useState(1);
    const limit = 10;

    const [query, setQuery] = useState("");
    const isSearching = query.trim().length > 0;

    const { data, isLoading } = usePostList(page, limit);
    const { data: found = [] } = useSearchPosts(query);

    const {
        deleteMutation
    } = usePost();


    const deletePostHandler = async (id: string) => {
        const confirmDelete = confirm(
            "Видалити цей пост?"
        );

        if (!confirmDelete) return;

        await deleteMutation.mutateAsync(id);
    };


    if (isLoading) {
        return <div>Завантаження...</div>;
    }


    return (
        <div className="mt-10 px-4 md:px-[5%] lg:px-[10%] py-4">

            <Manage
                title="Пости"
                query={query}
                onSearch={setQuery}
                onCreate={() => navigate("/posts/create")}
                isUpdateSelected={false}
                onUpdate={() => { }}
                onDelete={() => { }}
            />


            {isSearching ? (
                <PostList
                    items={found}
                    page={1}
                    totalPages={1}
                    total={found.length}
                    onPageChange={setPage}
                    onDelete={deletePostHandler}
                />
            ) : data && (
                <PostList
                    items={data.data}
                    page={data.page}
                    totalPages={data.totalPages}
                    total={data.total}
                    onPageChange={setPage}
                    onDelete={deletePostHandler}
                />
            )}

        </div>
    );
}