import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { DataSource, Repository } from 'typeorm';
import { AdminReplyDto, CloseTicketDto, CreateTicketDto, TicketListDto, UserReplyDto } from './dto';
import { TicketAuthor, TicketMessage } from './entities/ticket-message.entity';
import { Ticket, TicketStatus } from './entities/ticket.entity';

const rpcError = (statusCode: HttpStatus, message: string) => new RpcException({ statusCode, message });

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\n/g, '<br>');

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Ticket) private readonly tickets: Repository<Ticket>,
    @InjectRepository(TicketMessage) private readonly messages: Repository<TicketMessage>,
    @Inject('EMAIL_SERVICE') private readonly emailClient: ClientProxy,
  ) {}

  create(dto: CreateTicketDto) {
    return this.dataSource.transaction(async (manager) => {
      const ticket = await manager.getRepository(Ticket).save(
        manager.getRepository(Ticket).create({ name: dto.name, email: dto.email, userId: dto.userId ?? null }),
      );
      await manager.getRepository(TicketMessage).save(
        manager.getRepository(TicketMessage).create({
          ticketId: ticket.id,
          author: TicketAuthor.USER,
          authorId: dto.userId ?? null,
          content: dto.message,
        }),
      );
      return ticket;
    });
  }

  async list({ status, page, limit }: TicketListDto) {
    const [data, total] = await this.tickets.findAndCount({
      where: status ? { status } : {},
      order: { updatedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  listForUser(userId: string) {
    return this.tickets.find({ where: { userId }, order: { updatedAt: 'DESC' } });
  }

  async get(id: string) {
    const ticket = await this.tickets.findOne({ where: { id } });
    if (!ticket) throw rpcError(HttpStatus.NOT_FOUND, 'Ticket not found');
    const messages = await this.messages.find({ where: { ticketId: id }, order: { createdAt: 'ASC' } });
    return { ...ticket, messages };
  }

  async getForUser(id: string, userId: string) {
    const ticket = await this.get(id);
    if (ticket.userId !== userId) throw rpcError(HttpStatus.FORBIDDEN, 'Not your ticket');
    return ticket;
  }

  async adminReply({ id, adminId, content }: AdminReplyDto) {
    const ticket = await this.tickets.findOne({ where: { id } });
    if (!ticket) throw rpcError(HttpStatus.NOT_FOUND, 'Ticket not found');

    const message = await this.addMessage(ticket, TicketAuthor.ADMIN, adminId, content);
    if (!ticket.userId) await this.emailReply(ticket, content);
    return message;
  }

  async userReply({ id, userId, content }: UserReplyDto) {
    const ticket = await this.tickets.findOne({ where: { id } });
    if (!ticket) throw rpcError(HttpStatus.NOT_FOUND, 'Ticket not found');
    if (ticket.userId !== userId) throw rpcError(HttpStatus.FORBIDDEN, 'Not your ticket');
    return this.addMessage(ticket, TicketAuthor.USER, userId, content);
  }

  async close({ id, adminId }: CloseTicketDto) {
    const ticket = await this.tickets.findOne({ where: { id } });
    if (!ticket) throw rpcError(HttpStatus.NOT_FOUND, 'Ticket not found');
    if (ticket.status === TicketStatus.CLOSED) return ticket;

    Object.assign(ticket, { status: TicketStatus.CLOSED, closedAt: new Date(), closedBy: adminId });
    return this.tickets.save(ticket);
  }

  async stats() {
    const [row] = await this.tickets.query(
      `SELECT
         count(*) FILTER (WHERE status = 'open') AS open,
         count(*) FILTER (WHERE status = 'closed') AS closed,
         count(*) FILTER (WHERE status = 'closed' AND "closedAt" >= date_trunc('month', now())) AS "closedMonth",
         count(*) FILTER (WHERE status = 'closed' AND "closedAt" >= date_trunc('day', now())) AS "closedToday"
       FROM support.tickets`,
    );
    const values = row as Record<'open' | 'closed' | 'closedMonth' | 'closedToday', string>;
    return {
      open: Number(values.open),
      closed: Number(values.closed),
      closedMonth: Number(values.closedMonth),
      closedToday: Number(values.closedToday),
    };
  }

  private async addMessage(ticket: Ticket, author: TicketAuthor, authorId: string, content: string) {
    const message = await this.messages.save(this.messages.create({ ticketId: ticket.id, author, authorId, content }));
    ticket.status = TicketStatus.OPEN;
    ticket.closedAt = null;
    ticket.closedBy = null;
    await this.tickets.save(ticket);
    return message;
  }

  private async emailReply(ticket: Ticket, content: string) {
    try {
      await firstValueFrom(
        this.emailClient.send('send_email', {
          to: { name: ticket.name, email: ticket.email },
          from: { name: 'Workzora', email: process.env.SMTP_USER },
          subject: 'Workzora support',
          html: `<p>${escapeHtml(content)}</p>`,
        }),
      );
    } catch (error) {
      this.logger.warn(`Support email to ticket ${ticket.id} failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
