export interface Category {
    id:string;
    title: string;
    description: string;
    parentId?: string | null;
}

export interface CategoryTreeNode {
    id: string;
    title: string;
    count: number;
    specializations: { id: string; title: string; count: number }[];
}