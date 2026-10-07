import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export const NOTIFICATION_TYPES = ['projects', 'messages', 'payments', 'system'] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export type NotificationParams = Record<string, string | number>;

@Entity({ name: 'notifications', schema: 'notifications' })
@Index(['userId', 'createdAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  userId!: string;

  @Column({ type: 'varchar', length: 20 })
  type!: NotificationType;

  @Column({ type: 'varchar', length: 60 })
  key!: string;

  @Column({ type: 'jsonb', default: {} })
  params!: NotificationParams;

  @Column({ type: 'varchar', length: 300, nullable: true })
  link!: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  dedupeKey!: string | null;

  @Column({ default: false })
  isRead!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
