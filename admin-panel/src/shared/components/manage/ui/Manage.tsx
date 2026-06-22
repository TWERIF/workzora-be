import { Input } from "@/components/ui/input";
import type { ManageProps } from "../model/types";
import { Button } from "@/components/ui/button";

export default function Manage(props: ManageProps) {
    return (
        <div>
            <h1 className="text-[25px]">{props.title}</h1>
            <div className="flex w-full justify-between mt-[10px]">
                <Input
                    className="max-w-1/2"
                    placeholder={`Пошук у розділі ${props.title}`}
                    value={props.query}
                    onChange={(e) => props.onSearch(e.target.value || "")}
                />
                {props.isUpdateSelected && props.onUpdate ? (
                    <Button onClick={props.onUpdate}>Оновити</Button>
                ) : null}
                {props.isUpdateSelected && props.onDelete ? (
                    <Button variant={"destructive"} onClick={props.onDelete}>Видалити</Button>
                ) : null}
                <Button onClick={props.onCreate}>Створити</Button>
            </div>
        </div>
    )
}