import { Wallet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Project } from "@/features/payment-data/model/types";
import { PaymentCard } from "./PaymentCard";

interface PaymentCardListProps {
    projects: Project[];
    isLoading?: boolean;
    onSelect: (id: string) => void;
}

export const PaymentCardList = ({ projects, isLoading, onSelect }: PaymentCardListProps) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-[92px] rounded-xl" />
                ))}
            </div>
        );
    }

    if (!projects.length) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
                <Wallet className="size-6 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">Платежів не знайдено</p>
                <p className="max-w-xs text-sm text-muted-foreground">
                    Тут з&apos;являться проєкти, коли з&apos;являться дані про оплату.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((project) => (
                <PaymentCard
                    key={project.id}
                    project={project}
                    onClick={() => onSelect(project.id)}
                />
            ))}
        </div>
    );
};