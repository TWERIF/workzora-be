export interface ManageProps {
    title: string;
    query: string;
    onSearch: (s: string) => void;
    onCreate: () => void;
    isUpdateSelected?: boolean;
    onUpdate?: () => void;
    onDelete?: () => void;
}