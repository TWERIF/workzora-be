import { Card, CardContent } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { StatsDay } from "../model/types";

const BAR_COLOR = "#2563eb";

interface MetricChartProps {
    title: string;
    data: StatsDay[];
    dataKey: keyof Omit<StatsDay, "day">;
    format?: (value: number) => string;
    allowDecimals?: boolean;
}

const shortDay = (day: string) => {
    const [, month, date] = day.split("-");
    return `${date}.${month}`;
};

const defaultFormat = (value: number) => value.toLocaleString("uk-UA");

export function MetricChart({ title, data, dataKey, format = defaultFormat, allowDecimals = false }: MetricChartProps) {
    return (
        <Card>
            <CardContent className="h-64 px-2 pt-4">
                <p className="mb-2 px-2 text-sm font-medium text-muted-foreground">{title}</p>
                <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap={2}>
                        <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.08} />
                        <XAxis
                            dataKey="day"
                            tickFormatter={shortDay}
                            tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={16}
                        />
                        <YAxis
                            allowDecimals={allowDecimals}
                            tickFormatter={(value: number) => format(value)}
                            tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }}
                            tickLine={false}
                            axisLine={false}
                            width={64}
                        />
                        <Tooltip
                            cursor={{ fill: "currentColor", fillOpacity: 0.06 }}
                            labelFormatter={(label) => shortDay(String(label))}
                            formatter={(value) => [format(Number(value)), title]}
                            contentStyle={{ borderRadius: 8, fontSize: 12 }}
                            itemStyle={{ color: "inherit" }}
                        />
                        <Bar dataKey={dataKey} fill={BAR_COLOR} radius={[4, 4, 0, 0]} maxBarSize={28} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
