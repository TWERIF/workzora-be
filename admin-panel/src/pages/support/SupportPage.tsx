import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { TicketStatus } from "@/features/support/model/types";
import { useTickets, useTicketStats } from "@/features/support/model/useSupport";
import { TicketConversation } from "@/features/support/ui/TicketConversation";
import Pagination from "@/shared/components/Pagination";
import { formatDate } from "@/shared/utils/format";
import { Inbox } from "lucide-react";
import { useState } from "react";

const LIMIT = 20;
const TABS: { status: TicketStatus; label: string }[] = [
    { status: "open", label: "Нові та відкриті" },
    { status: "closed", label: "Історія (закриті)" },
];

function StatTile({ label, value }: { label: string; value: number | undefined }) {
    return (
        <Card>
            <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{value ?? "—"}</p>
            </CardContent>
        </Card>
    );
}

export default function SupportPage() {
    const [status, setStatus] = useState<TicketStatus>("open");
    const [page, setPage] = useState(1);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const { data, isLoading, isFetching } = useTickets({ status, page, limit: LIMIT });
    const { data: stats } = useTicketStats();
    const tickets = data?.data ?? [];

    return (
        <div className="mx-auto mt-10 max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">Підтримка</h1>
                <p className="mt-1 text-sm text-muted-foreground">Звернення з форми контактів і відповіді користувачам</p>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatTile label="Відкриті" value={stats?.open} />
                <StatTile label="Закрито сьогодні" value={stats?.closedToday} />
                <StatTile label="Закрито за місяць" value={stats?.closedMonth} />
                <StatTile label="Закрито всього" value={stats?.closed} />
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
                {TABS.map((tab) => (
                    <Button
                        key={tab.status}
                        variant={tab.status === status ? "default" : "outline"}
                        onClick={() => {
                            setStatus(tab.status);
                            setPage(1);
                            setSelectedId(null);
                        }}
                    >
                        {tab.label}
                    </Button>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                <div className="space-y-2">
                    {isLoading ? (
                        Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-16 rounded-xl" />)
                    ) : tickets.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-12 text-center">
                            <Inbox className="size-6 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Звернень немає</p>
                        </div>
                    ) : (
                        tickets.map((ticket) => (
                            <button
                                key={ticket.id}
                                type="button"
                                onClick={() => setSelectedId(ticket.id)}
                                className={`w-full rounded-xl border p-3 text-left transition-colors ${
                                    ticket.id === selectedId ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30" : "border-border hover:bg-muted/50"
                                }`}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <p className="truncate font-medium text-foreground">{ticket.name}</p>
                                    <span className="shrink-0 text-xs text-muted-foreground">{formatDate(ticket.updatedAt)}</span>
                                </div>
                                <p className="truncate text-sm text-muted-foreground">{ticket.email}</p>
                            </button>
                        ))
                    )}
                    <Pagination page={page} totalPages={data?.totalPages ?? 1} disabled={isFetching} onChange={setPage} />
                </div>

                <div>
                    {selectedId ? (
                        <TicketConversation ticketId={selectedId} />
                    ) : (
                        <div className="flex h-full min-h-[200px] items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
                            Оберіть звернення
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
