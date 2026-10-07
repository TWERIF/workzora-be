import { Body, Controller, Delete, ForbiddenException, Get, HttpException, HttpStatus, Inject, Param, ParseUUIDPipe, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles, RolesGuard } from '../auth/guards/role-guard';
import { CurrentUser, UserRole } from '../common/auth-user';
import type { AuthUser } from '../common/auth-user';
import { PaginationQueryDto } from '../common/pagination.dto';
import { sendRpc } from '../common/rpc';
import { AddCardDto, CardDto } from './dto';

@ApiTags('payment-data')
@ApiCookieAuth()
@Controller('payment-data')
@UseGuards(RolesGuard)
export class PaymentDataController {
  constructor(
    @Inject('PAYMENT_DATA_SERVICE') private readonly paymentDataClient: ClientProxy,
    @Inject('PROJECT_SERVICE') private readonly projectClient: ClientProxy,
  ) {}

  @Roles('admin')
  @Get('get-many')
  @ApiOperation({ summary: 'Project payments (admin)' })
  getMany(@CurrentUser() user: AuthUser, @Query() query: PaginationQueryDto) {
    return sendRpc(this.projectClient, 'payments.findMany', { id: user.id, role: user.role, ...query });
  }

  @Roles('admin')
  @Get('get-one/:id')
  @ApiOperation({ summary: 'Project payment (admin)' })
  getOne(@Param('id', ParseUUIDPipe) id: string) {
    return sendRpc(this.projectClient, 'payments.findOne', { id });
  }

  @Post()
  @ApiOperation({ summary: 'Link a payout card' })
  create(@Body() data: CardDto, @CurrentUser() user: AuthUser) {
    return sendRpc(this.paymentDataClient, 'paymentData.create', { ...data, userId: user.id });
  }

  @Put()
  @ApiOperation({ summary: 'Replace the payout card' })
  update(@Body() data: CardDto, @CurrentUser() user: AuthUser) {
    return sendRpc(this.paymentDataClient, 'paymentData.update', { ...data, userId: user.id });
  }

  @Get('cards')
  @ApiOperation({ summary: 'Own linked cards, primary first' })
  cards(@CurrentUser() user: AuthUser) {
    return sendRpc(this.paymentDataClient, 'paymentData.list', { userId: user.id });
  }

  @Post('cards')
  @ApiOperation({ summary: 'Link a card (up to 5)' })
  addCard(@Body() data: AddCardDto, @CurrentUser() user: AuthUser) {
    return sendRpc(this.paymentDataClient, 'paymentData.add', { ...data, userId: user.id });
  }

  @Patch('cards/:id/primary')
  @ApiOperation({ summary: 'Make a card primary' })
  setPrimary(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return sendRpc(this.paymentDataClient, 'paymentData.setPrimary', { id, userId: user.id });
  }

  @Delete('cards/:id')
  @ApiOperation({ summary: 'Remove a card' })
  removeCard(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return sendRpc(this.paymentDataClient, 'paymentData.remove', { id, userId: user.id });
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Masked payout card, own or any for an admin' })
  async getPaymentData(@Param('userId', ParseUUIDPipe) userId: string, @CurrentUser() user: AuthUser) {
    if (user.id !== userId && user.role !== UserRole.ADMIN) throw new ForbiddenException();

    try {
      return await sendRpc(this.paymentDataClient, 'paymentData.getByUserId', { userId });
    } catch (error) {
      if (error instanceof HttpException && error.getStatus() === HttpStatus.NOT_FOUND) return null;
      throw error;
    }
  }
}
