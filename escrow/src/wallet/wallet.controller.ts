import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  AdminWithdrawalsDto,
  CompleteWithdrawalDto,
  CreateWithdrawalDto,
  RejectWithdrawalDto,
  TransactionsDto,
  UserIdDto,
  WithdrawalIdDto,
  WithdrawalsDto,
} from './dto';
import { ExchangeRateService } from './exchange-rate.service';
import { WalletService } from './wallet.service';

@Controller()
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly exchangeRate: ExchangeRateService,
  ) {}

  @MessagePattern('wallet.rate')
  rate() {
    return this.exchangeRate.getUsdRate();
  }

  @MessagePattern('wallet.summary')
  summary(@Payload() data: UserIdDto) {
    return this.walletService.getSummary(data.userId);
  }

  @MessagePattern('wallet.transactions')
  transactions(@Payload() data: TransactionsDto) {
    return this.walletService.listTransactions(data.userId, data.kind, data.from);
  }

  @MessagePattern('wallet.withdrawals')
  withdrawals(@Payload() data: WithdrawalsDto) {
    return this.walletService.listWithdrawals(data.userId, data.from);
  }

  @MessagePattern('wallet.withdrawals.create')
  createWithdrawal(@Payload() data: CreateWithdrawalDto) {
    return this.walletService.createWithdrawal(data);
  }

  @MessagePattern('wallet.admin.withdrawals')
  adminWithdrawals(@Payload() data: AdminWithdrawalsDto) {
    return this.walletService.adminListWithdrawals(data);
  }

  @MessagePattern('wallet.admin.withdrawals.getOne')
  adminWithdrawal(@Payload() data: WithdrawalIdDto) {
    return this.walletService.getWithdrawal(data.id);
  }

  @MessagePattern('wallet.admin.withdrawals.complete')
  completeWithdrawal(@Payload() data: CompleteWithdrawalDto) {
    return this.walletService.completeWithdrawal(data.id, data.adminId);
  }

  @MessagePattern('wallet.admin.withdrawals.reject')
  rejectWithdrawal(@Payload() data: RejectWithdrawalDto) {
    return this.walletService.rejectWithdrawal(data.id, data.adminId, data.note);
  }
}
