import {
    Body,
    Controller,
    Get,
    Inject,
    Param,
    Post,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    ConfirmEscrowDto,
    CreateEscrowDto,
    MonobankWebhookEventDto,
    OpenDisputeDto,
    ResolveDisputeDto,
} from './dto/invoice.dto';

@Controller('escrow')
export class EscrowController {
    constructor(
        @Inject('INVOICES_SERVICE') private readonly invoicesClient: ClientProxy,
    ) { }

    @Post()
    create(@Body() data: CreateEscrowDto) {
        return firstValueFrom(
            this.invoicesClient.send('invoices.create', data),
        );
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
    confirm(@Param('id') id: string, @Body() data: Omit<ConfirmEscrowDto, 'invoiceId'>) {
        return firstValueFrom(
            this.invoicesClient.send('invoices.confirm', {
                ...data,
                invoiceId: id,
            }),
        );
    }

    @Post(':id/dispute')
    openDispute(
        @Param('id') id: string,
        @Body() data: Omit<OpenDisputeDto, 'invoiceId'>,
    ) {
        return firstValueFrom(
            this.invoicesClient.send('invoices.dispute.open', {
                ...data,
                invoiceId: id,
            }),
        );
    }

    @Post(':id/dispute/resolve')
    resolveDispute(
        @Param('id') id: string,
        @Body() data: Omit<ResolveDisputeDto, 'invoiceId'>,
    ) {
        return firstValueFrom(
            this.invoicesClient.send('invoices.dispute.resolve', {
                ...data,
                invoiceId: id,
            }),
        );
    }

    @Post('webhook/status')
    handleWebhookStatus(@Body() data: MonobankWebhookEventDto) {
        return firstValueFrom(
            this.invoicesClient.send('invoices.webhook.status', data),
        );
    }
}