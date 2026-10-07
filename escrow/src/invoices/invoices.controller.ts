import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  ClientIdDto,
  ConfirmEscrowDto,
  CreateEscrowDto,
  IdDto,
  InvoiceForUserDto,
  InvoiceStatusDto,
  MonobankInvoiceDto,
  OpenDisputeDto,
  ReleaseEscrowDto,
  ResolveDisputeDto,
  StatsRangeDto,
} from './dto/invoice.dto';
import { InvoicesService } from './invoices.service';

@Controller()
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @MessagePattern('stats.earnings')
  stats(@Payload() range: StatsRangeDto) {
    return this.invoicesService.stats(range);
  }

  @MessagePattern('invoices.clientSpent')
  clientSpent(@Payload() data: ClientIdDto) {
    return this.invoicesService.clientSpent(data.clientId);
  }

  @MessagePattern('invoices.create')
  create(@Payload() data: CreateEscrowDto) {
    return this.invoicesService.createEscrow(data);
  }

  @MessagePattern('invoices.getById')
  getById(@Payload() data: IdDto) {
    return this.invoicesService.getById(data.id);
  }

  @MessagePattern('invoices.getForUser')
  getForUser(@Payload() data: InvoiceForUserDto) {
    return this.invoicesService.getForUser(data);
  }

  @MessagePattern('invoices.getByProjectId')
  getByProjectId(@Payload() data: IdDto) {
    return this.invoicesService.getByProjectId(data.id);
  }

  @MessagePattern('invoices.status')
  getStatus(@Payload() data: InvoiceStatusDto) {
    return this.invoicesService.getStatusForUser(data);
  }

  @MessagePattern('invoices.confirm')
  confirm(@Payload() data: ConfirmEscrowDto) {
    return this.invoicesService.confirmByClient(data.invoiceId, data.clientId);
  }

  @MessagePattern('invoices.release')
  release(@Payload() data: ReleaseEscrowDto) {
    return this.invoicesService.releaseByProject(data.projectId, data.clientId);
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
  handleWebhookStatus(@Payload() data: MonobankInvoiceDto) {
    return this.invoicesService.syncFromMonobank(data.invoiceId);
  }
}
