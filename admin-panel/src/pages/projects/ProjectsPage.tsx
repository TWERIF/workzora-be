import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminProject, ProjectStatus } from "@/features/projects/model/types";
import { useAdminProjects, useCloseProject, useDeleteProject, useSetFeatured } from "@/features/projects/model/useProjects";
import { PROJECT_STATUS_LABELS, ProjectRow } from "@/features/projects/ui/ProjectRow";
import DeleteDialog from "@/shared/components/DeleteDialog";
import Pagination from "@/shared/components/Pagination";
import { apiErrorMessage } from "@/shared/utils/apiError";
import { FolderOpen } from "lucide-react";
import { useState } from "react";

const LIMIT = 15;
const STATUSES: (ProjectStatus | undefined)[] = [undefined, "open", "awaiting_payment", "in_progress", "completed", "closed"];


export default function ProjectsPage() {
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<ProjectStatus | undefined>(undefined);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [toDelete, setToDelete] = useState<AdminProject | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const { data, isLoading, isFetching } = useAdminProjects({ status, search: search || undefined, page, limit: LIMIT });
    const deleteMutation = useDeleteProject();
    const closeMutation = useCloseProject();
    const featuredMutation = useSetFeatured();
    const isBusy = deleteMutation.isPending || closeMutation.isPending || featuredMutation.isPending;

    const projects = data?.data ?? [];

    const handleDelete = async () => {
        if (!toDelete) return;
        setActionError(null);
        try {
            await deleteMutation.mutateAsync(toDelete.id);
        } catch (error) {
            setActionError(apiErrorMessage(error));
        }
        setToDelete(null);
    };

    const handleClose = async (project: AdminProject) => {
        setActionError(null);
        try {
            await closeMutation.mutateAsync(project.id);
        } catch (error) {
            setActionError(apiErrorMessage(error));
        }
    };

    const handleToggleFeatured = async (project: AdminProject) => {
        setActionError(null);
        try {
            await featuredMutation.mutateAsync({ id: project.id, isFeatured: !project.isFeatured });
        } catch (error) {
            setActionError(apiErrorMessage(error));
        }
    };

    return (
        <div className="mx-auto mt-10 max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">Проєкти</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Усі проєкти платформи. Оплачений проєкт у роботі не можна видалити чи закрити.
                </p>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
                {STATUSES.map((item) => (
                    <Button
                        key={item ?? "all"}
                        variant={item === status ? "default" : "outline"}
                        onClick={() => {
                            setStatus(item);
                            setPage(1);
                        }}
                    >
                        {item ? PROJECT_STATUS_LABELS[item] : "Усі"}
                    </Button>
                ))}
            </div>

            <form
                className="mb-6 flex gap-2"
                onSubmit={(event) => {
                    event.preventDefault();
                    setSearch(searchInput.trim());
                    setPage(1);
                }}
            >
                <Input
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Пошук за назвою або описом"
                />
                <Button type="submit">Знайти</Button>
            </form>

            {actionError && <p className="mb-4 text-sm text-destructive">{actionError}</p>}

            {isLoading ? (
                <div className="space-y-2">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Skeleton key={index} className="h-14 rounded-xl" />
                    ))}
                </div>
            ) : projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
                    <FolderOpen className="size-6 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">Проєктів не знайдено</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full min-w-[720px] text-left text-sm">
                        <thead className="bg-muted/50 text-xs text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 font-medium">Проєкт</th>
                                <th className="py-3 pr-4 font-medium">Бюджет</th>
                                <th className="py-3 pr-4 font-medium">Статус</th>
                                <th className="py-3 pr-4 font-medium">Ставки</th>
                                <th className="py-3 pr-4 font-medium">Створено</th>
                                <th className="py-3 pr-4" />
                            </tr>
                        </thead>
                        <tbody className="[&_td:first-child]:px-4 [&_td:last-child]:pr-4">
                            {projects.map((project) => (
                                <ProjectRow
                                    key={project.id}
                                    project={project}
                                    isBusy={isBusy}
                                    onDelete={setToDelete}
                                    onClose={handleClose}
                                    onToggleFeatured={handleToggleFeatured}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Pagination page={page} totalPages={data?.totalPages ?? 1} disabled={isFetching} onChange={setPage} />

            <DeleteDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)} onDelete={handleDelete} />
        </div>
    );
}
