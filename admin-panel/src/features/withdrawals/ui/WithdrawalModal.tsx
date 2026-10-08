import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
    useCompleteWithdrawal,
    useRejectWithdrawal,
    useWithdrawalDetail,
} from "@/features/withdrawals/model/useWithdrawals";
import { formatCardNumber, formatDate, formatUsd } from "@/shared/utils/format";
import { Calendar, Check, Copy, CreditCard, Landmark, TriangleAlert, X } from "lucide-react";
import { useState } from "react";
import { STATUS_LABELS } from "./WithdrawalCard";

interface WithdrawalModalProps {
    withdrawalId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const WithdrawalModal = ({ withdrawalId, open, onOpenChange }: WithdrawalModalProps) => {
    const { data: withdrawal, isLoading, isError } = useWithdrawalDetail(withdrawalId ?? "");
    const completeMutation = useCompleteWithdrawal();
    const rejectMutation = useRejectWithdrawal();
    const [isRejecting, setIsRejecting] = useState(false);
    const [note, setNote] = useState("");

    const close = () => {
        setIsRejecting(false);
        setNote("");
        onOpenChange(false);
    };

    const isPending = completeMutation.isPending || rejectMutation.isPending;
    const mutationError = completeMutation.error ?? rejectMutation.error;

    return (
        <Dialog open={open} onOpenChange={(value) => (value ? onOpenChange(true) : close())}>
            <DialogContent className="sm:max-w-md">
                {isLoading && (
                    <div className="space-y-4 py-1">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-28 w-full rounded-lg" />
                    </div>
                )}

                {!isLoading && isError && (
                    <div className="flex flex-col items-center gap-2 py-10 text-center">
                        <TriangleAlert className="size-6 text-muted-foreground" />
                        <p className="text-sm font-medium text-foreground">Не вдалося завантажити заявку</p>
                    </div>
                )}

                {!isLoading && !isError && withdrawal && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="pr-6 text-lg leading-snug">
                                {withdrawal.user
                                    ? `${withdrawal.user.firstName} ${withdrawal.user.lastName}`.trim()
                                    : "Користувач"}
                            </DialogTitle>
                            <DialogDescription className="flex items-center gap-1.5 text-sm">
                                <Calendar className="size-3.5 shrink-0" />
                                {formatDate(withdrawal.createdAt)} · {STATUS_LABELS[withdrawal.status]}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3 py-1">
                            <div className="flex items-center justify-between rounded-lg border border-border p-3">
                                <span className="text-sm font-medium text-foreground">Сума до виплати</span>
                                <span className="text-lg font-semibold tabular-nums text-primary">
                                    {formatUsd(withdrawal.amount)}
                                </span>
                            </div>

                            <div className="rounded-lg border border-border bg-muted/40 p-3">
                                <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    <Landmark className="size-3.5" />
                                    Реквізити для оплати
                                </div>
                                <div className="flex items-center justify-between gap-2 text-sm font-medium tabular-nums">
                                    <span className="flex items-center gap-2">
                                        <CreditCard className="size-4 shrink-0 text-muted-foreground" />
                                        {withdrawal.cardNumber
                                            ? formatCardNumber(withdrawal.cardNumber)
                                            : withdrawal.maskedCard}
                                    </span>
                                    {withdrawal.cardNumber && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label="Скопіювати номер картки"
                                            onClick={() => navigator.clipboard.writeText(withdrawal.cardNumber!)}
                                        >
                                            <Copy className="size-4" />
                                        </Button>
                                    )}
                                </div>
                                {!withdrawal.cardNumber && (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Користувач видалив або змінив картку. Уточніть реквізити.
                                    </p>
                                )}
                            </div>

                            {withdrawal.note && (
                                <p className="text-sm text-muted-foreground">Коментар: {withdrawal.note}</p>
                            )}

                            {isRejecting && (
                                <>
                                    <Separator />
                                    <Textarea
                                        placeholder="Причина відхилення (необов'язково)"
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                    />
                                </>
                            )}

                            {mutationError && (
                                <p className="text-sm text-destructive">Не вдалося оновити заявку. Спробуйте ще раз.</p>
                            )}
                        </div>

                        {withdrawal.status === "processing" && (
                            <DialogFooter className="gap-2 sm:gap-2">
                                {isRejecting ? (
                                    <>
                                        <Button variant="outline" className="flex-1" onClick={() => setIsRejecting(false)}>
                                            Назад
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            className="flex-1"
                                            disabled={isPending}
                                            onClick={() => rejectMutation.mutate(
                                                { id: withdrawal.id, note: note.trim() || undefined },
                                                { onSuccess: close },
                                            )}
                                        >
                                            <X className="size-4" />
                                            Відхилити й повернути кошти
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button variant="outline" className="flex-1" onClick={() => setIsRejecting(true)}>
                                            <X className="size-4" />
                                            Відхилити
                                        </Button>
                                        <Button
                                            className="flex-1"
                                            disabled={isPending}
                                            onClick={() => completeMutation.mutate(withdrawal.id, { onSuccess: close })}
                                        >
                                            <Check className="size-4" />
                                            Виплачено
                                        </Button>
                                    </>
                                )}
                            </DialogFooter>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};
