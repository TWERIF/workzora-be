import { Injectable, Logger } from "@nestjs/common";

interface CreateInvoiceResponse {
    invoiceId: string;
    pageUrl: string;
}

// Subset of Monobank's GET /api/merchant/invoice/status response.
// status is one of: created | processing | hold | success | failure | reversed | expired
interface InvoiceStatusResponse {
    invoiceId: string;
    status: string;
    failureReason?: string;
    amount: number;
    ccy: number;
    createdDate: string;
    modifiedDate: string;
}

@Injectable()
export class MonobankService {
    private readonly logger = new Logger(MonobankService.name);
    private readonly baseUrl = "https://api.monobank.ua";
    private readonly token: string;

    constructor() {
        this.token = process.env.MONO_API!;
    }

    async createDebitInvoice(
        amount: number,
        orderId: string,
        destination: string,
        redirectUrl?: string,
    ): Promise<CreateInvoiceResponse> {
        const res = await fetch(`${this.baseUrl}/api/merchant/invoice/create`, {
            method: "POST",
            headers: { "X-Token": this.token, "Content-Type": "application/json" },
            body: JSON.stringify({
                amount,
                ccy: 840,
                merchantPaymInfo: { reference: orderId, destination },
                webHookUrl: process.env.MONO_WEBHOOK_URL,
                validity: 3600,
                redirectUrl
            }),
        });

        if (!res.ok) {
            this.logger.error(`createDebitInvoice failed: ${res.status} ${await res.text()}`);
            throw new Error("Monobank invoice creation failed");
        }
        return res.json();
    }

    // Used for the frontend's status-polling flow: webhooks can be delayed or
    // simply never arrive (e.g. no public MONO_WEBHOOK_URL in dev), so the
    // gateway needs a way to ask Monobank directly "what's the current status
    // of this invoice?" instead of relying solely on the webhook having fired.
    async checkStatus(invoiceId: string): Promise<InvoiceStatusResponse> {
        const res = await fetch(
            `${this.baseUrl}/api/merchant/invoice/status?invoiceId=${encodeURIComponent(invoiceId)}`,
            {
                method: "GET",
                headers: { "X-Token": this.token },
            },
        );

        if (!res.ok) {
            this.logger.error(`checkStatus failed for ${invoiceId}: ${res.status} ${await res.text()}`);
            throw new Error("Monobank status check failed");
        }
        return res.json();
    }

    async refund(invoiceId: string): Promise<void> {
        const res = await fetch(`${this.baseUrl}/api/merchant/invoice/cancel`, {
            method: "POST",
            headers: { "X-Token": this.token, "Content-Type": "application/json" },
            body: JSON.stringify({ invoiceId }),
        });

        if (!res.ok) {
            this.logger.error(`refund failed for ${invoiceId}: ${res.status} ${await res.text()}`);
            throw new Error("Monobank refund failed");
        }
    }
}