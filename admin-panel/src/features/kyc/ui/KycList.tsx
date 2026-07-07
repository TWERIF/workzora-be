import { ScrollArea } from "@/components/ui/scroll-area";
import KycItem from "./KycItem";
import type { Verification } from "../model/types";

interface KycListProps {
    verifications: Verification[];

    selectedId?: string;

    onSelect: (verification: Verification | null) => void;

    page: number;
    total: number;
    limit: number;

    onPageChange: (page: number) => void;
}

export default function KycList({
    verifications,
    selectedId,
    onSelect,
    page,
    total,
    limit,
    onPageChange,
}: KycListProps) {
    const totalPages = Math.ceil(total / limit);

    const selectVerification = (
        verification: Verification,
    ) => {
        if (selectedId === verification.id) {
            onSelect(null);
            return;
        }

        onSelect(verification);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="border-b px-4 py-3 text-sm text-muted-foreground">
                Всього заявок: {total}
            </div>

            <ScrollArea className="flex-1">
                <div className="p-3 flex flex-col gap-2">
                    {verifications.map((verification) => (
                        <KycItem
                            key={verification.id}
                            verification={verification}
                            selected={
                                selectedId === verification.id
                            }
                            onClick={() =>
                                selectVerification(
                                    verification,
                                )
                            }
                        />
                    ))}
                </div>
            </ScrollArea>

            {totalPages > 1 && (
                <div className="border-t p-3 flex justify-center gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() =>
                            onPageChange(page - 1)
                        }
                        className="border rounded px-3 py-1"
                    >
                        ←
                    </button>

                    <span className="text-sm text-muted-foreground">
                        {page} / {totalPages}
                    </span>

                    <button
                        disabled={page === totalPages}
                        onClick={() =>
                            onPageChange(page + 1)
                        }
                        className="border rounded px-3 py-1"
                    >
                        →
                    </button>
                </div>
            )}
        </div>
    );
}