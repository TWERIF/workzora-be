import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InvoicesService } from './invoices.service';
import {
    ConfirmEscrowDto,
    CreateEscrowDto,
    MonobankWebhookEventDto,
    OpenDisputeDto,
    ResolveDisputeDto,
} from './dto/invoice.dto';

@Controller('invoices')
export class InvoicesController {
    constructor(
        private readonly invoicesService: InvoicesService
    ) { }

    @MessagePattern('invoices.create')
    create(@Payload() data: CreateEscrowDto) {
        return this.invoicesService.createEscrow(data);
    }

    @MessagePattern('invoices.getById')
    getById(@Payload() data: { id: string }) {
        return this.invoicesService.getById(data.id);
    }

    @MessagePattern('invoices.getByProjectId')
    getByProjectId(@Payload() data: { id: string }) {
        return this.invoicesService.getByProjectId(data.id);
    }

    @MessagePattern('invoices.status')
    getStatus(@Payload() data: { invoiceId: string }) {
        return this.invoicesService.getStatus(data.invoiceId);
    }

    @MessagePattern('invoices.confirm')
    confirm(@Payload() data: ConfirmEscrowDto) {
        return this.invoicesService.confirmByClient(data.invoiceId, data.clientId);
    }

    @MessagePattern('invoices.dispute.open')
    openDispute(@Payload() data: OpenDisputeDto) {
        return this.invoicesService.openDispute(data.invoiceId, data.initiatorId, data.reason);
    }

    @MessagePattern('invoices.dispute.resolve')
    resolveDispute(@Payload() data: ResolveDisputeDto) {
        return this.invoicesService.resolveDispute(data.invoiceId, data.adminId, data.decision, data.note);
    }

    @MessagePattern('invoices.webhook.status')
    handleWebhookStatus(@Payload() data: MonobankWebhookEventDto) {
        return this.invoicesService.handleStatusUpdate(data.invoiceId, data.status);
    }
}