import { Button } from "@/components/ui/button";
import { getPaginationRange } from "@/shared/utils/format";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
    page: number;
    totalPages: number;
    disabled?: boolean;
    onChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, disabled = false, onChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <nav aria-label="Пагінація" className="mt-8 flex flex-wrap items-center justify-center gap-1">
            <Button
                variant="outline"
                size="icon"
                aria-label="Попередня сторінка"
                disabled={page <= 1 || disabled}
                onClick={() => onChange(Math.max(1, page - 1))}
            >
                <ChevronLeft className="size-4" />
            </Button>

            {getPaginationRange(page, totalPages).map((item, index) =>
                item === "ellipsis" ? (
                    <span key={`ellipsis-${index}`} className="flex size-9 items-center justify-center text-muted-foreground">
                        <MoreHorizontal className="size-4" />
                    </span>
                ) : (
                    <Button
                        key={item}
                        variant={item === page ? "default" : "outline"}
                        size="icon"
                        disabled={disabled}
                        aria-current={item === page ? "page" : undefined}
                        onClick={() => onChange(item)}
                        className="tabular-nums"
                    >
                        {item}
                    </Button>
                ),
            )}

            <Button
                variant="outline"
                size="icon"
                aria-label="Наступна сторінка"
                disabled={page >= totalPages || disabled}
                onClick={() => onChange(Math.min(totalPages, page + 1))}
            >
                <ChevronRight className="size-4" />
            </Button>
        </nav>
    );
}
