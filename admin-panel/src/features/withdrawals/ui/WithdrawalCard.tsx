import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Withdrawal, WithdrawalStatus } from "@/features/withdrawals/model/types";
import { formatDate, formatUsd } from "@/shared/utils/format";
import { Calendar, CreditCard } from "lucide-react";

export const STATUS_LABELS: Record<WithdrawalStatus, string> = {
    processing: "В обробці",
    completed: "Виплачено",
    rejected: "Відхилено",
};

const STATUS_VARIANT: Record<WithdrawalStatus, "default" | "secondary" | "destructive"> = {
    processing: "default",
    completed: "secondary",
    rejected: "destructive",
};

interface WithdrawalCardProps {
    withdrawal: Withdrawal;
    onClick?: () => void;
}

export const WithdrawalCard = ({ withdrawal, onClick }: WithdrawalCardProps) => {
    const userName = withdrawal.user
        ? `${withdrawal.user.firstName} ${withdrawal.user.lastName}`.trim()
        : "Користувач";

    return (
        <Card
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onClick?.();
                }
            }}
            className="cursor-pointer border-border/70 transition-colors hover:border-primary/50 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-1 text-base font-semibold leading-snug">{userName}</CardTitle>
                    <Badge variant={STATUS_VARIANT[withdrawal.status]}>{STATUS_LABELS[withdrawal.status]}</Badge>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 pt-0">
                <span className="text-lg font-semibold tabular-nums">{formatUsd(withdrawal.amount)}</span>
                <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                        <CreditCard className="size-3.5 shrink-0" />
                        {withdrawal.maskedCard.slice(-4)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <Calendar className="size-3.5 shrink-0" />
                        {formatDate(withdrawal.createdAt)}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
};
