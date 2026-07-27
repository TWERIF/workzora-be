import { usePost, usePostList } from "@/features/posts/model/usePosts";
import PostList from "@/features/posts/ui/PostList";
import Manage from "@/shared/components/manage/ui/Manage";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PostsPage() {
    const navigate = useNavigate();

    const [page, setPage] = useState(1);
    const limit = 10;

    const { data, isLoading } = usePostList(page, limit);

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
                query=""
                onSearch={(s) => console.log(s)}
                onCreate={() => navigate("/posts/create")}
                isUpdateSelected={false}
                onUpdate={() => { }}
                onDelete={() => { }}
            />


            {data && (
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