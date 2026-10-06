import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Inject,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Roles, RolesGuard } from '../auth/guards/role-guard';
import { Public } from '../auth/public.decorator';
import { sendRpc } from '../common/rpc';

// Balances live in the escrow service (escrow_queue); card data in user-service.
// All amounts here are USD, bonuses are whole points.
@Controller('wallet')
@UseGuards(RolesGuard)
export class WalletController {
    constructor(
        @Inject('INVOICES_SERVICE') private readonly escrowClient: ClientProxy,
        @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    ) { }

    // USD -> UAH rate from the Monobank public API
    @Public()
    @Get('rate')
    rate() {
        return sendRpc(this.escrowClient, 'wallet.rate');
    }

    @Get('me')
    summary(@Req() req) {
        return sendRpc(this.escrowClient, 'wallet.summary', { userId: req.user.id });
    }

    @Get('transactions')
    transactions(@Req() req, @Query('kind') kind?: 'balance' | 'bonus', @Query('from') from?: string) {
        return sendRpc(this.escrowClient, 'wallet.transactions', { userId: req.user.id, kind, from });
    }

    @Get('withdrawals')
    withdrawals(@Req() req, @Query('from') from?: string) {
        return sendRpc(this.escrowClient, 'wallet.withdrawals', { userId: req.user.id, from });
    }

    @Post('withdrawals')
    async createWithdrawal(@Req() req, @Body() body: { amount: number }) {
        const amount = Number(body?.amount);
        if (!Number.isFinite(amount) || amount <= 0) {
            throw new BadRequestException('Invalid amount');
        }

        const card = await sendRpc(this.userClient, 'paymentData.getByUserId', { userId: req.user.id })
            .catch(() => null);
        if (!card?.maskedCardNumber) {
            throw new BadRequestException('Add a card before requesting a withdrawal');
        }

        return sendRpc(this.escrowClient, 'wallet.withdrawals.create', {
            userId: req.user.id,
            amount,
            maskedCard: card.maskedCardNumber,
        });
    }

    @Roles('admin')
    @Get('admin/withdrawals')
    async adminWithdrawals(
        @Query('status') status?: string,
        @Query('page') page = 1,
        @Query('limit') limit = 10,
    ) {
        const result = await sendRpc(this.escrowClient, 'wallet.admin.withdrawals', {
            status: status || undefined,
            page: Number(page),
            limit: Number(limit),
        });

        const userIds = [...new Set<string>(result.data.map((w) => w.userId))];
        const users = userIds.length ? await sendRpc<any[]>(this.userClient, 'users.getMany', userIds) : [];

        return {
            ...result,
            data: result.data.map((w) => ({ ...w, user: users.find((u) => u.id === w.userId) ?? null })),
        };
    }

    // Includes the full card number: the admin transfers the money manually.
    @Roles('admin')
    @Get('admin/withdrawals/:id')
    async adminWithdrawal(@Param('id') id: string) {
        const withdrawal = await sendRpc(this.escrowClient, 'wallet.admin.withdrawals.getOne', { id });

        const [user, cardNumber] = await Promise.all([
            sendRpc(this.userClient, 'users.get', { id: withdrawal.userId }).catch(() => null),
            sendRpc<string>(this.userClient, 'paymentData.getFullCardNumber', { userId: withdrawal.userId })
                .catch(() => null),
        ]);

        return { ...withdrawal, user, cardNumber };
    }

    @Roles('admin')
    @Patch('admin/withdrawals/:id/complete')
    complete(@Param('id') id: string, @Req() req) {
        return sendRpc(this.escrowClient, 'wallet.admin.withdrawals.complete', { id, adminId: req.user.id });
    }

    @Roles('admin')
    @Patch('admin/withdrawals/:id/reject')
    reject(@Param('id') id: string, @Req() req, @Body() body: { note?: string }) {
        return sendRpc(this.escrowClient, 'wallet.admin.withdrawals.reject', {
            id,
            adminId: req.user.id,
            note: body?.note,
        });
    }
}
