import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { TicketMessage } from './ticket-message.entity';

export enum TicketStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

@Entity({ name: 'tickets', schema: 'support' })
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  userId!: string | null;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Index()
  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.OPEN })
  status!: TicketStatus;

  @Column({ type: 'timestamptz', nullable: true })
  closedAt!: Date | null;

  @Column({ type: 'uuid', nullable: true })
  closedBy!: string | null;

  @OneToMany(() => TicketMessage, (message) => message.ticket)
  messages!: TicketMessage[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
