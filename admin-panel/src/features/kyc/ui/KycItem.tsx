import { Card } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import type { Verification } from "../model/types";

interface KycItemProps {
    verification: Verification;
    selected?: boolean;
    onClick: () => void;
}

const statusMap = {
    not_verified: { variant: "destructive", label: "Не верифіковано" },
    in_progress: { variant: "secondary", label: "На перевірці" },
    verified: { variant: "default", label: "Верифіковано" },
} as const;

const statusOf = (status: string) => statusMap[status as keyof typeof statusMap] ?? { variant: "secondary" as const, label: status };

export default function KycItem({
    verification,
    selected,
    onClick,
}: KycItemProps) {
    return (
        <Card
            onClick={onClick}
            className={`
                cursor-pointer
                p-4
                transition-colors
                hover:bg-muted/50
                ${selected ? "border-primary" : ""}
            `}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h4 className="font-medium truncate">
                        {verification.user?.firstName + verification.user?.lastName ||
                            verification.user?.email}
                    </h4>

                    <p className="text-sm text-muted-foreground mt-1">
                        {verification.user?.email}
                    </p>

                    <p className="text-xs text-muted-foreground mt-2">
                        {new Date(
                            verification.createdAt,
                        ).toLocaleString()}
                    </p>
                </div>

                <Badge variant={statusOf(verification.status).variant}>{statusOf(verification.status).label}</Badge>
            </div>
        </Card>
    );
}