import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Roles, RolesGuard } from '../auth/guards/role-guard';
import { Public } from '../auth/public.decorator';
import { CurrentUser, UserRole } from '../common/auth-user';
import type { AuthUser } from '../common/auth-user';
import { ProjectRecord } from '../common/project';
import { sendRpc } from '../common/rpc';
import { CreateEscrowBodyDto, OpenDisputeBodyDto, ResolveDisputeBodyDto } from './dto/invoice.dto';

const USD_CURRENCY_CODE = 840;

@ApiTags('escrow')
@Controller('escrow')
@UseGuards(RolesGuard)
export class EscrowController {
  constructor(
    @Inject('INVOICES_SERVICE') private readonly invoicesClient: ClientProxy,
    @Inject('PROJECT_SERVICE') private readonly projectClient: ClientProxy,
  ) {}

  @Roles('client')
  @Post()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Reserve the project budget, returns the payment page' })
  async create(@Body() data: CreateEscrowBodyDto, @CurrentUser() user: AuthUser) {
    const project = await sendRpc<ProjectRecord | null>(this.projectClient, 'projects.findOneProject', { id: data.projectId });

    if (!project || project.clientId !== user.id) {
      throw new ForbiddenException('Only the project owner can reserve funds');
    }
    if (project.status !== 'awaiting_payment' || !project.freelancerId) {
      throw new BadRequestException('This project is not awaiting payment');
    }

    return sendRpc(this.invoicesClient, 'invoices.create', {
      amount: Math.round(Number(project.price) * 100),
      currencyCode: USD_CURRENCY_CODE,
      projectId: project.id,
      clientId: project.clientId,
      freelancerId: project.freelancerId,
      description: data.description ?? project.title,
    });
  }

  @Get(':id')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Escrow details for its parties or an admin' })
  getById(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return sendRpc(this.invoicesClient, 'invoices.getForUser', {
      id,
      userId: user.id,
      isAdmin: user.role === UserRole.ADMIN,
    });
  }

  @Get('status/:invoiceId')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Payment status by Monobank invoice id' })
  getStatus(@Param('invoiceId') invoiceId: string, @CurrentUser() user: AuthUser) {
    return sendRpc(this.invoicesClient, 'invoices.status', { invoiceId, userId: user.id });
  }

  @Post(':id/confirm')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Client confirms the work and releases the funds' })
  confirm(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return sendRpc(this.invoicesClient, 'invoices.confirm', { clientId: user.id, invoiceId: id });
  }

  @Post(':id/dispute')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Open a dispute' })
  openDispute(@Param('id', ParseUUIDPipe) id: string, @Body() data: OpenDisputeBodyDto, @CurrentUser() user: AuthUser) {
    return sendRpc(this.invoicesClient, 'invoices.dispute.open', { reason: data.reason, initiatorId: user.id, invoiceId: id });
  }

  @Roles('admin')
  @Post(':id/dispute/resolve')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Resolve a dispute (admin)' })
  resolveDispute(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: ResolveDisputeBodyDto,
    @CurrentUser() user: AuthUser,
  ) {
    return sendRpc(this.invoicesClient, 'invoices.dispute.resolve', { ...data, adminId: user.id, invoiceId: id });
  }

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @Post('webhook/status')
  @HttpCode(200)
  @ApiOperation({ summary: 'Monobank webhook, the status is re-read from Monobank' })
  handleWebhookStatus(@Body('invoiceId') invoiceId: unknown) {
    if (typeof invoiceId !== 'string' || !invoiceId || invoiceId.length > 100) {
      throw new BadRequestException('invoiceId is required');
    }
    return sendRpc(this.invoicesClient, 'invoices.webhook.status', { invoiceId });
  }
}
