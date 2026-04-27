import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatRoom } from './chatRoom.entity';

@Entity({ name: 'messages', schema: 'project' })
@Index(['chatId', 'createdAt'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => ChatRoom, (chat) => chat.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chatId' })
  chatRoom!: ChatRoom;

  @Column({ type: 'uuid' })
  chatId!: string;

  @Column({ type: 'uuid' })
  senderId!: string;

  @Column({ type: 'uuid', nullable: true })
  receiverId!: string;

  @Column({ type: 'uuid' })
  projectId!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'varchar', nullable: true })
  fileUrl!: string | null;

  @Column({ default: false })
  isRead!: boolean;

  @Column({ default: false })
  isEdited!: boolean;

  @Column({ default: false })
  isDeleted!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
