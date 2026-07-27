import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Project } from "@/features/payment-data/model/types";
import { formatDate, formatNumber } from "@/shared/utils/format";
import { Calendar } from "lucide-react";

interface PaymentCardProps {
    project: Project;
    onClick?: () => void;
}

export const PaymentCard = ({ project, onClick }: PaymentCardProps) => {
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
                <CardTitle className="line-clamp-2 text-base font-semibold leading-snug">
                    {project.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-3 pt-0">
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="size-3.5 shrink-0" />
                    {formatDate(project.createdAt)}
                </span>
                <Badge variant="secondary" className="shrink-0 text-sm font-medium tabular-nums">
                    {formatNumber(project.price)}
                </Badge>
            </CardContent>
        </Card>
    );
};