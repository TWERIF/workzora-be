import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WalletTransaction } from "./entities/wallet-transaction.entity";
import { Wallet } from "./entities/wallet.entity";
import { Withdrawal } from "./entities/withdrawal.entity";
import { ExchangeRateService } from "./exchange-rate.service";
import { WalletController } from "./wallet.controller";
import { WalletService } from "./wallet.service";

@Module({
    imports: [TypeOrmModule.forFeature([Wallet, WalletTransaction, Withdrawal])],
    providers: [WalletService, ExchangeRateService],
    controllers: [WalletController],
    exports: [WalletService],
})
export class WalletModule { }
