import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useCloseTicket, useReplyToTicket, useTicket } from "../model/useSupport";

const formatDateTime = (value: string) =>
    new Date(value).toLocaleString("uk-UA", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export function TicketConversation({ ticketId }: { ticketId: string }) {
    const { data: ticket, isLoading } = useTicket(ticketId);
    const replyMutation = useReplyToTicket();
    const closeMutation = useCloseTicket();
    const [reply, setReply] = useState("");

    if (isLoading || !ticket) return <Skeleton className="h-80 rounded-xl" />;

    const sendReply = async () => {
        if (!reply.trim()) return;
        await replyMutation.mutateAsync({ id: ticket.id, content: reply.trim() });
        setReply("");
    };

    return (
        <Card>
            <CardContent className="space-y-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                        <p className="font-medium text-foreground">{ticket.name}</p>
                        <p className="text-sm text-muted-foreground">
                            {ticket.email}
                            {ticket.userId ? " · зареєстрований користувач" : " · гість, відповідь піде на email"}
                        </p>
                    </div>
                    {ticket.status === "open" && (
                        <Button variant="outline" size="sm" disabled={closeMutation.isPending} onClick={() => closeMutation.mutate(ticket.id)}>
                            Закрити звернення
                        </Button>
                    )}
                </div>

                <div className="max-h-[420px] space-y-3 overflow-y-auto rounded-lg bg-muted/40 p-3">
                    {ticket.messages.map((message) => (
                        <div
                            key={message.id}
                            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                                message.author === "admin" ? "ml-auto bg-blue-600 text-white" : "bg-background text-foreground"
                            }`}
                        >
                            <p className="whitespace-pre-wrap break-words">{message.content}</p>
                            <p className={`mt-1 text-[11px] ${message.author === "admin" ? "text-white/70" : "text-muted-foreground"}`}>
                                {message.author === "admin" ? "Підтримка" : ticket.name} · {formatDateTime(message.createdAt)}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="space-y-2">
                    <Textarea
                        value={reply}
                        onChange={(event) => setReply(event.target.value)}
                        placeholder="Відповідь користувачу"
                        rows={3}
                    />
                    <div className="flex justify-end">
                        <Button disabled={!reply.trim() || replyMutation.isPending} onClick={sendReply}>
                            Надіслати
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
