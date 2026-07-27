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
import { usePaymentDataDetail, useToCompleted } from "@/features/payment-data/model/usePaymentInfo";
import { formatCardNumber, formatDate, formatMoney, getCurrencyAlpha } from "@/shared/utils/format";
import { Calendar, Check, CreditCard, Landmark, TriangleAlert, X } from "lucide-react";

interface PaymentModalProps {
    projectId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCancel?: (escrowId: string) => void;
}

export const PaymentModal = ({ projectId, open, onOpenChange, onCancel }: PaymentModalProps) => {
    const { data: escrow, isLoading, isError } = usePaymentDataDetail(projectId ?? "");
    const { mutate: markCompleted, isPending } = useToCompleted();

    const sumToPay = escrow ? escrow.amount - escrow.commissionAmount : 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                {isLoading && (
                    <div className="space-y-4 py-1">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-28 w-full rounded-lg" />
                        <Skeleton className="h-16 w-full rounded-lg" />
                    </div>
                )}

                {!isLoading && isError && (
                    <div className="flex flex-col items-center gap-2 py-10 text-center">
                        <TriangleAlert className="size-6 text-muted-foreground" />
                        <p className="text-sm font-medium text-foreground">
                            Не вдалося завантажити дані про оплату
                        </p>
                        <p className="max-w-xs text-sm text-muted-foreground">
                            Спробуйте оновити сторінку або оберіть інший проєкт.
                        </p>
                    </div>
                )}

                {!isLoading && !isError && escrow && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="pr-6 text-lg leading-snug">{escrow.title}</DialogTitle>
                            <DialogDescription className="flex items-center gap-1.5 text-sm">
                                <Calendar className="size-3.5 shrink-0" />
                                {formatDate(escrow.createdAt)}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3 py-1">
                            <div className="space-y-2 rounded-lg border border-border p-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Сума проєкту</span>
                                    <span className="font-medium tabular-nums">
                                        {formatMoney(escrow.amount, escrow.currencyCode)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Комісія сервісу</span>
                                    <span className="font-medium tabular-nums text-muted-foreground">
                                        − {formatMoney(escrow.commissionAmount, escrow.currencyCode)}
                                    </span>
                                </div>

                                <Separator className="my-1" />

                                <div className="flex items-center justify-between pt-0.5">
                                    <span className="text-sm font-medium text-foreground">
                                        Сума до оплати
                                    </span>
                                    <span className="text-lg font-semibold tabular-nums text-primary">
                                        {formatMoney(sumToPay, escrow.currencyCode)}
                                    </span>
                                </div>
                            </div>

                            <div className="rounded-lg border border-border bg-muted/40 p-3">
                                <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    <Landmark className="size-3.5" />
                                    Реквізити для оплати
                                </div>
                                <div className="flex items-center gap-2 text-sm font-medium tabular-nums">
                                    <CreditCard className="size-4 shrink-0 text-muted-foreground" />
                                    {formatCardNumber(escrow.card)}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {getCurrencyAlpha(escrow.currencyCode)}
                                </p>
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                    onCancel?.(escrow.id);
                                    onOpenChange(false);
                                }}
                            >
                                <X className="size-4" />
                                Скасувати
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={() => markCompleted({ id: escrow.id }, {
                                    onSuccess: () => onOpenChange(false),
                                })}
                                disabled={isPending}
                            >
                                <Check className="size-4" />
                                Оплачено
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};