import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { ChatRoom } from '../../chat/entities/chatRoom.entity';

export enum ProjectStatus {
  OPEN = 'open',
  AWAITING_PAYMENT = 'awaiting_payment',
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
  description!: string;

  @ManyToMany(
    () => Category,
    (category) => category.projects,
  )
  @JoinTable({
    name: 'project_categories',
    joinColumn: {
      name: 'project_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'category_id',
      referencedColumnName: 'id',
    },
  })
  categories!: Category[];

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price!: number;

  @Column({ type: 'uuid' })
  clientId!: string;

  @Column({ type: 'uuid', nullable: true })
  freelancerId!: string;

  @Column({ nullable: true })
  time!: number;

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