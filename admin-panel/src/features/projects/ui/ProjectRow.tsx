import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/shared/utils/format";
import type { AdminProject, ProjectStatus } from "../model/types";

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
    open: "Відкритий",
    awaiting_payment: "Очікує оплати",
    in_progress: "В роботі",
    completed: "Завершений",
    closed: "Закритий",
};

const DELETABLE: ProjectStatus[] = ["open", "awaiting_payment"];
const CLOSABLE: ProjectStatus[] = ["open", "awaiting_payment", "completed"];

interface ProjectRowProps {
    project: AdminProject;
    isBusy: boolean;
    onDelete: (project: AdminProject) => void;
    onClose: (project: AdminProject) => void;
}

export function ProjectRow({ project, isBusy, onDelete, onClose }: ProjectRowProps) {
    return (
        <tr className="border-b border-border last:border-0">
            <td className="py-3 pr-4">
                <p className="font-medium text-foreground">{project.title}</p>
                <p className="text-xs text-muted-foreground">
                    {project.categories.map((category) => category.title).join(", ") || "—"}
                </p>
            </td>
            <td className="py-3 pr-4 tabular-nums">${Number(project.price).toLocaleString("uk-UA")}</td>
            <td className="py-3 pr-4">
                <Badge variant="outline">{PROJECT_STATUS_LABELS[project.status]}</Badge>
            </td>
            <td className="py-3 pr-4 tabular-nums">{project.proposalsCount ?? 0}</td>
            <td className="py-3 pr-4 text-muted-foreground">{formatDate(project.createdAt)}</td>
            <td className="py-3">
                <div className="flex justify-end gap-2">
                    {CLOSABLE.includes(project.status) && (
                        <Button size="sm" variant="outline" disabled={isBusy} onClick={() => onClose(project)}>
                            Закрити
                        </Button>
                    )}
                    {DELETABLE.includes(project.status) && (
                        <Button size="sm" variant="destructive" disabled={isBusy} onClick={() => onDelete(project)}>
                            Видалити
                        </Button>
                    )}
                </div>
            </td>
        </tr>
    );
}
