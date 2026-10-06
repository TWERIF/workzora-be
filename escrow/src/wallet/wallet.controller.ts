import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { TransactionKind } from "./entities/wallet-transaction.entity";
import { WithdrawalStatus } from "./entities/withdrawal.entity";
import { ExchangeRateService } from "./exchange-rate.service";
import { WalletService } from "./wallet.service";

@Controller()
export class WalletController {
    constructor(
        private readonly walletService: WalletService,
        private readonly exchangeRate: ExchangeRateService,
    ) { }

    @MessagePattern("wallet.rate")
    rate() {
        return this.exchangeRate.getUsdRate();
    }

    @MessagePattern("wallet.summary")
    summary(@Payload() data: { userId: string }) {
        return this.walletService.getSummary(data.userId);
    }

    @MessagePattern("wallet.transactions")
    transactions(@Payload() data: { userId: string; kind?: TransactionKind; from?: string }) {
        return this.walletService.listTransactions(data.userId, data.kind, data.from);
    }

    @MessagePattern("wallet.withdrawals")
    withdrawals(@Payload() data: { userId: string; from?: string }) {
        return this.walletService.listWithdrawals(data.userId, data.from);
    }

    @MessagePattern("wallet.withdrawals.create")
    createWithdrawal(@Payload() data: { userId: string; amount: number; maskedCard: string }) {
        return this.walletService.createWithdrawal(data);
    }

    @MessagePattern("wallet.admin.withdrawals")
    adminWithdrawals(@Payload() data: { status?: WithdrawalStatus; page?: number; limit?: number }) {
        return this.walletService.adminListWithdrawals(data);
    }

    @MessagePattern("wallet.admin.withdrawals.getOne")
    adminWithdrawal(@Payload() data: { id: string }) {
        return this.walletService.getWithdrawal(data.id);
    }

    @MessagePattern("wallet.admin.withdrawals.complete")
    completeWithdrawal(@Payload() data: { id: string; adminId: string }) {
        return this.walletService.completeWithdrawal(data.id, data.adminId);
    }

    @MessagePattern("wallet.admin.withdrawals.reject")
    rejectWithdrawal(@Payload() data: { id: string; adminId: string; note?: string }) {
        return this.walletService.rejectWithdrawal(data.id, data.adminId, data.note);
    }
}
