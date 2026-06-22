import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import { useCategoryStore } from "@/pages/categories/model/store";

export default function CategoryItem({
    id,
    name,
    onClick,
    description = ""
}: {
    id: string;
    name: string;
    onClick: () => void;
    description?: string;
}) {
    const category = useCategoryStore((state) => state.category);
    const isSelected = category?.id === id;
    return (
        <Card
            className={`w-full p-[10px] ${isSelected ? "border-[blue] border-1" : ""}`}
            onClick={onClick}
        >
            <CardHeader>{name}</CardHeader>
            <CardDescription>{description}</CardDescription>
        </Card>
    )
}