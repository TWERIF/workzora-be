import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStatsOverview } from "@/features/stats/model/useStats";
import { MetricChart } from "@/features/stats/ui/MetricChart";
import { useState } from "react";

const RANGES = [7, 30, 90] as const;

const uah = (kopecks: number) =>
    `${(kopecks / 100).toLocaleString("uk-UA", { maximumFractionDigits: 2 })} ₴`;

const PROJECT_STATUS_LABELS: Record<string, string> = {
    open: "Відкриті",
    awaiting_payment: "Очікують оплати",
    in_progress: "В роботі",
    completed: "Завершені",
    closed: "Закриті",
};

const ROLE_LABELS: Record<string, string> = {
    client: "Клієнти",
    freelancer: "Фрилансери",
    admin: "Адміни",
};

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
    return (
        <Card>
            <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
                {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
            </CardContent>
        </Card>
    );
}

function Breakdown({ title, items, labels }: { title: string; items: Record<string, number>; labels: Record<string, string> }) {
    const total = Object.values(items).reduce((sum, value) => sum + value, 0) || 1;
    return (
        <Card>
            <CardContent className="p-4">
                <p className="mb-3 text-sm font-medium text-muted-foreground">{title}</p>
                <div className="space-y-2">
                    {Object.entries(items).map(([key, count]) => (
                        <div key={key} className="text-sm">
                            <div className="flex justify-between">
                                <span className="text-foreground">{labels[key] ?? key}</span>
                                <span className="tabular-nums text-muted-foreground">{count}</span>
                            </div>
                            <div className="mt-1 h-1.5 rounded-full bg-muted">
                                <div className="h-1.5 rounded-full bg-blue-600" style={{ width: `${(count / total) * 100}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default function StatsPage() {
    const [days, setDays] = useState<number>(30);
    const { data, isLoading, isError } = useStatsOverview(days);
    const number = (value: number) => value.toLocaleString("uk-UA");

    return (
        <div className="mx-auto mt-10 max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Статистика</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Відвідувачі, користувачі, проєкти та дохід платформи
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {RANGES.map((range) => (
                        <Button key={range} variant={range === days ? "default" : "outline"} onClick={() => setDays(range)}>
                            {range} днів
                        </Button>
                    ))}
                </div>
            </div>

            {isError && <p className="mb-4 text-sm text-destructive">Не вдалося завантажити статистику</p>}

            {isLoading || !data ? (
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-xl" />
                    ))}
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        <StatTile label="Відвідувачі" value={number(data.period.visitors)} hint={`${number(data.period.views)} переглядів за період`} />
                        <StatTile label="Нові користувачі" value={number(data.period.newUsers)} hint={`Всього: ${number(data.totals.users)}`} />
                        <StatTile label="Нові проєкти" value={number(data.period.newProjects)} hint={`Всього: ${number(data.totals.projects)}`} />
                        <StatTile label="Комісія платформи" value={uah(data.period.commission)} hint={`Всього: ${uah(data.totals.commission)}`} />
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <MetricChart title="Відвідувачі за день" data={data.series} dataKey="visitors" />
                        <MetricChart title="Нові користувачі за день" data={data.series} dataKey="newUsers" />
                        <MetricChart title="Нові проєкти за день" data={data.series} dataKey="newProjects" />
                        <MetricChart title="Комісія платформи за день" data={data.series} dataKey="commission" format={uah} allowDecimals />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Breakdown title="Проєкти за статусом" items={data.totals.projectsByStatus} labels={PROJECT_STATUS_LABELS} />
                        <Breakdown title="Користувачі за роллю" items={data.totals.usersByRole} labels={ROLE_LABELS} />
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Обіг оплачених угод за весь час: {uah(data.totals.volume)}. Відвідувачів рахує сам сайт
                        (один браузер = один відвідувач за день), тому цифри можуть відрізнятися від Google Analytics.
                    </p>
                </div>
            )}
        </div>
    );
}
