import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { VerificationStatus } from "../model/types";
import { useKyc } from "../model/useKyc";

interface KycPageProps {
    verificationId?: string;
}

export default function KycPage({
    verificationId,
}: KycPageProps) {
    const {
        verification,
        isLoadingVerification,
        updateStatusMutation,
    } = useKyc(verificationId);

    if (!verificationId) {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground">
                Оберіть заявку
            </div>
        );
    }

    if (isLoadingVerification) {
        return (
            <div className="p-6">
                Завантаження...
            </div>
        );
    }

    if (!verification) {
        return (
            <div className="p-6">
                Заявка не знайдена
            </div>
        );
    }

    const updateStatus = (
        status: VerificationStatus,
    ) => {
        updateStatusMutation.mutate({
            id: verification.id,
            status,
        });
    };

    return (
        <div className="p-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>
                            KYC Заявка
                        </CardTitle>

                        <Badge>
                            {verification.status}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div>
                        <h3 className="font-medium">
                            Користувач
                        </h3>

                        <div className="text-sm text-muted-foreground mt-2">
                            <p>
                                {verification.user?.fullName}
                            </p>

                            <p>
                                {verification.user?.email}
                            </p>
                        </div>
                    </div>

                    <div>

                        <div className="flex flex-col gap-2">
                            {verification.documentUrl && (
                                <a
                                    href={
                                        verification.documentUrl
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-primary underline"
                                >
                                    Документ
                                </a>
                            )}

                            {verification.selfieUrl && (
                                <a
                                    href={
                                        verification.selfieUrl
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-primary underline"
                                >
                                    Селфі
                                </a>
                            )}
                        </div>
                    </div>

                    {verification.status ===
                        VerificationStatus.IN_PROGRESS && (
                            <div className="flex gap-3">
                                <Button
                                    onClick={() =>
                                        updateStatus(
                                            VerificationStatus.VERIFIED,
                                        )
                                    }
                                >
                                    Підтвердити
                                </Button>

                                <Button
                                    variant="destructive"
                                    onClick={() =>
                                        updateStatus(
                                            VerificationStatus.NOT_VERIFIED,
                                        )
                                    }
                                >
                                    Відмовити
                                </Button>
                            </div>
                        )}
                </CardContent>
            </Card>
        </div>
    );
}