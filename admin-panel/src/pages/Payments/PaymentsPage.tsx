import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { WithdrawalStatus } from "@/features/withdrawals/model/types";
import { useWithdrawalList } from "@/features/withdrawals/model/useWithdrawals";
import { STATUS_LABELS, WithdrawalCard } from "@/features/withdrawals/ui/WithdrawalCard";
import { WithdrawalModal } from "@/features/withdrawals/ui/WithdrawalModal";
import { getPaginationRange } from "@/shared/utils/format";
import { ChevronLeft, ChevronRight, MoreHorizontal, Wallet } from "lucide-react";
import { useState } from "react";

const LIMIT = 12;
const STATUSES: WithdrawalStatus[] = ["processing", "completed", "rejected"];

// Project payments now land on the freelancer's wallet balance automatically when the
// client completes the project; the admin only pays out withdrawal requests from that balance.
export default function PaymentsPage() {
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<WithdrawalStatus>("processing");
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const { data, isLoading, isFetching } = useWithdrawalList({ status, page, limit: LIMIT });

    const withdrawals = data?.data ?? [];
    const totalPages = Number(data?.totalPages ?? 1);

    return (
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 mt-10">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">Виплати</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Заявки фрилансерів на виведення коштів з балансу на картку
                </p>
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
                {STATUSES.map((item) => (
                    <Button
                        key={item}
                        variant={item === status ? "default" : "outline"}
                        onClick={() => {
                            setStatus(item);
                            setPage(1);
                        }}
                    >
                        {STATUS_LABELS[item]}
                    </Button>
                ))}
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="h-[120px] rounded-xl" />
                    ))}
                </div>
            ) : withdrawals.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
                    <Wallet className="size-6 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">Заявок не знайдено</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {withdrawals.map((withdrawal) => (
                        <WithdrawalCard
                            key={withdrawal.id}
                            withdrawal={withdrawal}
                            onClick={() => setSelectedId(withdrawal.id)}
                        />
                    ))}
                </div>
            )}

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

            <WithdrawalModal
                withdrawalId={selectedId}
                open={Boolean(selectedId)}
                onOpenChange={(open) => !open && setSelectedId(null)}
            />
        </div>
    );
}