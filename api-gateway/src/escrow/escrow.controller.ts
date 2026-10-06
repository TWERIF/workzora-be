import {
    Body,
    Controller,
    ForbiddenException,
    Get,
    Inject,
    Param,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Roles, RolesGuard } from '../auth/guards/role-guard';
import { sendRpc } from '../common/rpc';
import {
    ConfirmEscrowDto,
    CreateEscrowDto,
    MonobankWebhookEventDto,
    OpenDisputeDto,
    ResolveDisputeDto,
} from './dto/invoice.dto';

const USD_CURRENCY_CODE = 840;

@Controller('escrow')
@UseGuards(RolesGuard)
export class EscrowController {
    constructor(
        @Inject('INVOICES_SERVICE') private readonly invoicesClient: ClientProxy,
        @Inject('PROJECT_SERVICE') private readonly projectClient: ClientProxy,
    ) { }

    // Amount, freelancer and client are taken from the project itself, not from the request
    // body, so a client can't reserve less than the agreed price or pay for someone else's project.
    @Roles('client')
    @Post()
    async create(@Body() data: Pick<CreateEscrowDto, 'projectId' | 'description'>, @Req() req) {
        const project = await sendRpc(this.projectClient, 'projects.findOneProject', { id: data.projectId });

        if (!project || project.clientId !== req.user.id) {
            throw new ForbiddenException('Only the project owner can reserve funds');
        }
        if (project.status !== 'awaiting_payment' || !project.freelancerId) {
            throw new ForbiddenException('This project is not awaiting payment');
        }

        return sendRpc(this.invoicesClient, 'invoices.create', {
            amount: Math.round(Number(project.price) * 100),
            currencyCode: USD_CURRENCY_CODE,
            projectId: project.id,
            clientId: project.clientId,
            freelancerId: project.freelancerId,
            description: data.description ?? project.title,
        } satisfies CreateEscrowDto);
    }

    @Get(':id')
    getById(@Param('id') id: string) {
        return firstValueFrom(
            this.invoicesClient.send('invoices.getById', { id }),
        );
    }

    // Polled from the frontend's CheckoutModal every few seconds. `invoiceId`
    // here is the Monobank invoice id returned from POST /escrow, not our
    // internal escrow id.
    @Get('status/:invoiceId')
    getStatus(@Param('invoiceId') invoiceId: string) {
        return firstValueFrom(
            this.invoicesClient.send('invoices.status', { invoiceId }),
        );
    }

    @Post(':id/confirm')
    confirm(@Param('id') id: string, @Req() req) {
        return sendRpc(this.invoicesClient, 'invoices.confirm', {
            clientId: req.user.id,
            invoiceId: id,
        } satisfies ConfirmEscrowDto);
    }

    // the initiator is the logged-in user, never a value from the body
    @Post(':id/dispute')
    openDispute(
        @Param('id') id: string,
        @Body() data: Pick<OpenDisputeDto, 'reason'>,
        @Req() req,
    ) {
        return sendRpc(this.invoicesClient, 'invoices.dispute.open', {
            reason: data?.reason,
            initiatorId: req.user.id,
            invoiceId: id,
        });
    }

    @Roles('admin')
    @Post(':id/dispute/resolve')
    resolveDispute(
        @Param('id') id: string,
        @Body() data: Omit<ResolveDisputeDto, 'invoiceId' | 'adminId'>,
        @Req() req,
    ) {
        return sendRpc(this.invoicesClient, 'invoices.dispute.resolve', {
            ...data,
            adminId: req.user.id,
            invoiceId: id,
        });
    }

    @Post('webhook/status')
    handleWebhookStatus(@Body() data: MonobankWebhookEventDto) {
        return firstValueFrom(
            this.invoicesClient.send('invoices.webhook.status', data),
        );
    }
}