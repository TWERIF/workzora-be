import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AdminReplyDto, CloseTicketDto, CreateTicketDto, TicketIdDto, TicketListDto, UserIdDto, UserReplyDto, UserTicketDto } from './dto';
import { TicketsService } from './tickets.service';

@Controller()
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @MessagePattern('support.create')
  create(@Payload() data: CreateTicketDto) {
    return this.ticketsService.create(data);
  }

  @MessagePattern('support.list')
  list(@Payload() data: TicketListDto) {
    return this.ticketsService.list(data);
  }

  @MessagePattern('support.get')
  get(@Payload() data: TicketIdDto) {
    return this.ticketsService.get(data.id);
  }

  @MessagePattern('support.mine')
  mine(@Payload() data: UserIdDto) {
    return this.ticketsService.listForUser(data.userId);
  }

  @MessagePattern('support.getMine')
  getMine(@Payload() data: UserTicketDto) {
    return this.ticketsService.getForUser(data.id, data.userId);
  }

  @MessagePattern('support.adminReply')
  adminReply(@Payload() data: AdminReplyDto) {
    return this.ticketsService.adminReply(data);
  }

  @MessagePattern('support.userReply')
  userReply(@Payload() data: UserReplyDto) {
    return this.ticketsService.userReply(data);
  }

  @MessagePattern('support.close')
  close(@Payload() data: CloseTicketDto) {
    return this.ticketsService.close(data);
  }

  @MessagePattern('support.stats')
  stats() {
    return this.ticketsService.stats();
  }
}
