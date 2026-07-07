export interface CreatePostDto {
    title: string;
    teaser: string;
    imageUrl: File | null;
    article: string;
    tag: string;
}


export type UpdatePostDto = Partial<CreatePostDto>;


export interface Post {
    id: string;
    userId: string;
    title: string;
    teaser: string;
    imageUrl: string;
    article: string;
    createdAt: string;
    updatedAt: string;
}