import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { rpcError } from "./wallet.service";

interface MonoCurrencyRate {
    currencyCodeA: number;
    currencyCodeB: number;
    date: number;
    rateBuy?: number;
    rateSell?: number;
    rateCross?: number;
}

const USD = 840;
const UAH = 980;
const CACHE_TTL_MS = 5 * 60 * 1000;
const RETRY_AFTER_MS = 60 * 1000;

@Injectable()
export class ExchangeRateService {
    private readonly logger = new Logger(ExchangeRateService.name);
    private cached: { rate: number; updatedAt: Date; fetchedAt: number } | null = null;
    private lastAttemptAt = 0;
    private inFlight: Promise<void> | null = null;

    async getUsdRate(): Promise<{ currency: "USD"; rate: number; updatedAt: Date }> {
        const isStale = !this.cached || Date.now() - this.cached.fetchedAt > CACHE_TTL_MS;
        if (isStale && Date.now() - this.lastAttemptAt > RETRY_AFTER_MS) {
            this.lastAttemptAt = Date.now();
            this.inFlight = this.refresh().finally(() => (this.inFlight = null));
        }
        if (this.inFlight) await this.inFlight;

        if (!this.cached) {
            throw rpcError(HttpStatus.SERVICE_UNAVAILABLE, "Exchange rate is temporarily unavailable");
        }

        return { currency: "USD", rate: this.cached.rate, updatedAt: this.cached.updatedAt };
    }

    private async refresh(): Promise<void> {
        try {
            const res = await fetch("https://api.monobank.ua/bank/currency");
            if (!res.ok) {
                this.logger.warn(`Monobank currency request failed: ${res.status}`);
                return;
            }

            const rates: MonoCurrencyRate[] = await res.json();
            const usd = rates.find((r) => r.currencyCodeA === USD && r.currencyCodeB === UAH);
            const rate = usd?.rateSell ?? usd?.rateCross;
            if (!usd || !rate) {
                this.logger.warn("USD/UAH rate not found in Monobank response");
                return;
            }

            this.cached = { rate, updatedAt: new Date(usd.date * 1000), fetchedAt: Date.now() };
        } catch (error) {
            this.logger.error("Failed to fetch Monobank currency rates", error as Error);
        }
    }
}
