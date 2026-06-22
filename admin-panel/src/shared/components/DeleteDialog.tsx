import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface DeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDelete: () => void;
}

export default function DeleteDialog({ open, onOpenChange, onDelete }: DeleteDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-1/3 max-w-fit p-[40px]">
                <DialogHeader>
                    <DialogTitle>Ви впевнені?</DialogTitle>
                    <DialogDescription>
                        Цю дію неможливо буде скасувати. Це назавжди видалить дані.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-between w-full py-[10px]">
                    <Button className="p-[2px]" variant={"default"} onClick={() => onOpenChange(false)}>Скасувати</Button>
                    <Button className="p-[2px]" variant={"destructive"} onClick={onDelete}>Видалити</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}