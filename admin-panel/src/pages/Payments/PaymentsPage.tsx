import { Button } from "@/components/ui/button";
import { usePaymentDataList } from "@/features/payment-data/model/usePaymentInfo";
import { PaymentCardList } from "@/features/payment-data/ui/PaymentCardList";
import { PaymentModal } from "@/features/payment-data/ui/PaymentModal";
import { getPaginationRange } from "@/shared/utils/format";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { useState } from "react";

const LIMIT = 10;

export default function PaymentsPage() {
    const [page, setPage] = useState(1);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const { data, isLoading, isFetching } = usePaymentDataList({ page, limit: LIMIT });

    const projects = data?.data ?? [];
    const totalPages = Number(data?.totalPages ?? 1);

    return (
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 mt-10">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">Платежі</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Керуйте оплатами за завершені проєкти
                </p>
            </div>

            <PaymentCardList projects={projects} isLoading={isLoading} onSelect={setSelectedId} />

            {totalPages > 1 && (
                <nav
                    aria-label="Пагінація"
                    className="mt-8 flex flex-wrap items-center justify-center gap-1"
                >
                    <Button
                        variant="outline"
                        size="icon"
                        aria-label="Попередня сторінка"
                        disabled={page <= 1 || isFetching}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        <ChevronLeft className="size-4" />
                    </Button>

                    {getPaginationRange(page, totalPages).map((item, i) =>
                        item === "ellipsis" ? (
                            <span
                                key={`ellipsis-${i}`}
                                className="flex size-9 items-center justify-center text-muted-foreground"
                            >
                                <MoreHorizontal className="size-4" />
                            </span>
                        ) : (
                            <Button
                                key={item}
                                variant={item === page ? "default" : "outline"}
                                size="icon"
                                disabled={isFetching}
                                aria-current={item === page ? "page" : undefined}
                                onClick={() => setPage(item)}
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
                        disabled={page >= totalPages || isFetching}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                        <ChevronRight className="size-4" />
                    </Button>
                </nav>
            )}

            <PaymentModal
                projectId={selectedId}
                open={Boolean(selectedId)}
                onOpenChange={(open) => !open && setSelectedId(null)}
            />
        </div>
    );
}