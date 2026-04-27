import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { ChatRoom } from '../../chat/entities/chatRoom.entity';

export enum ProjectStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CLOSED = 'closed',
}

@Entity({ name: 'projects', schema: 'project' })
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  desc!: string;

  @Column({ type: 'simple-array', default: '' })
  stack!: string[];

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price!: number;

  @Column({ type: 'uuid' })
  clientId!: string;

  @Column({ type: 'uuid', nullable: true })
  freelancerId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'int', default: 0 })
  views!: number;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.OPEN,
  })
  status!: ProjectStatus;

  @OneToOne(() => ChatRoom, (chat) => chat.project)
  chatRoom!: ChatRoom;
}
