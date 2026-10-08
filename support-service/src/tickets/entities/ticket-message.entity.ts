import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Ticket } from './ticket.entity';

export enum TicketAuthor {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity({ name: 'ticket_messages', schema: 'support' })
@Index(['ticketId', 'createdAt'])
export class TicketMessage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  ticketId!: string;

  @ManyToOne(() => Ticket, (ticket) => ticket.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticketId' })
  ticket!: Ticket;

  @Column({ type: 'enum', enum: TicketAuthor })
  author!: TicketAuthor;

  @Column({ type: 'uuid', nullable: true })
  authorId!: string | null;

  @Column({ type: 'text' })
  content!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
