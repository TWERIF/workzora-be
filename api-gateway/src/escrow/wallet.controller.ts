import { BadRequestException, Body, Controller, Get, Inject, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles, RolesGuard } from '../auth/guards/role-guard';
import { Public } from '../auth/public.decorator';
import { CurrentUser } from '../common/auth-user';
import type { AuthUser } from '../common/auth-user';
import { sendRpc } from '../common/rpc';
import {
  AdminWithdrawalsQueryDto,
  CreateWithdrawalDto,
  HistoryQueryDto,
  RejectWithdrawalDto,
  TransactionsQueryDto,
} from './dto/invoice.dto';

interface WithdrawalRecord {
  id: string;
  userId: string;
}

interface UserRecord {
  id: string;
}

interface PaymentCard {
  maskedCardNumber?: string;
}

@ApiTags('wallet')
@Controller('wallet')
@UseGuards(RolesGuard)
export class WalletController {
  constructor(
    @Inject('INVOICES_SERVICE') private readonly escrowClient: ClientProxy,
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
  ) {}

  @Public()
  @Get('rate')
  @ApiOperation({ summary: 'USD to UAH rate' })
  rate() {
    return sendRpc(this.escrowClient, 'wallet.rate');
  }

  @Get('me')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Own balance and bonuses' })
  summary(@CurrentUser() user: AuthUser) {
    return sendRpc(this.escrowClient, 'wallet.summary', { userId: user.id });
  }

  @Get('transactions')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Own balance or bonus history' })
  transactions(@CurrentUser() user: AuthUser, @Query() query: TransactionsQueryDto) {
    return sendRpc(this.escrowClient, 'wallet.transactions', { ...query, userId: user.id });
  }

  @Get('withdrawals')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Own withdrawal requests' })
  withdrawals(@CurrentUser() user: AuthUser, @Query() query: HistoryQueryDto) {
    return sendRpc(this.escrowClient, 'wallet.withdrawals', { ...query, userId: user.id });
  }

  @Post('withdrawals')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Request a withdrawal to the linked card' })
  async createWithdrawal(@CurrentUser() user: AuthUser, @Body() body: CreateWithdrawalDto) {
    const card = await sendRpc<PaymentCard | null>(this.userClient, 'paymentData.getByUserId', { userId: user.id }).catch(
      () => null,
    );
    if (!card?.maskedCardNumber) {
      throw new BadRequestException('Add a card before requesting a withdrawal');
    }

    return sendRpc(this.escrowClient, 'wallet.withdrawals.create', {
      userId: user.id,
      amount: body.amount,
      maskedCard: card.maskedCardNumber,
    });
  }

  @Roles('admin')
  @Get('admin/withdrawals')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Withdrawal requests (admin)' })
  async adminWithdrawals(@Query() query: AdminWithdrawalsQueryDto) {
    const result = await sendRpc<{ data: WithdrawalRecord[] }>(this.escrowClient, 'wallet.admin.withdrawals', query);

    const userIds = [...new Set(result.data.map((withdrawal) => withdrawal.userId))];
    const users = userIds.length ? await sendRpc<UserRecord[]>(this.userClient, 'users.getMany', userIds) : [];
    const usersById = new Map(users.map((user) => [user.id, user]));

    return {
      ...result,
      data: result.data.map((withdrawal) => ({ ...withdrawal, user: usersById.get(withdrawal.userId) ?? null })),
    };
  }

  @Roles('admin')
  @Get('admin/withdrawals/:id')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Withdrawal with the full card number (admin)' })
  async adminWithdrawal(@Param('id', ParseUUIDPipe) id: string) {
    const withdrawal = await sendRpc<WithdrawalRecord>(this.escrowClient, 'wallet.admin.withdrawals.getOne', { id });

    const [user, cardNumber] = await Promise.all([
      sendRpc(this.userClient, 'users.get', { id: withdrawal.userId }).catch(() => null),
      sendRpc<string>(this.userClient, 'paymentData.getFullCardNumber', { userId: withdrawal.userId }).catch(() => null),
    ]);

    return { ...withdrawal, user, cardNumber };
  }

  @Roles('admin')
  @Patch('admin/withdrawals/:id/complete')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Mark a withdrawal as paid (admin)' })
  complete(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return sendRpc(this.escrowClient, 'wallet.admin.withdrawals.complete', { id, adminId: user.id });
  }

  @Roles('admin')
  @Patch('admin/withdrawals/:id/reject')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Reject a withdrawal and return the money (admin)' })
  reject(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser, @Body() body: RejectWithdrawalDto) {
    return sendRpc(this.escrowClient, 'wallet.admin.withdrawals.reject', { id, adminId: user.id, note: body.note });
  }
}
