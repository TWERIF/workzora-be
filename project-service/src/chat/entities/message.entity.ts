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

@Entity({ name: 'messages', schema: 'message' })
@Index(['chatId', 'createdAt'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => ChatRoom, (chat) => chat.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chatId' })
  chatRoom!: ChatRoom;

  @Column({ type: 'uuid' })
  chatId!: string;

  @Column({ type: 'uuid', nullable: true })
  senderId!: string | null;

  @Column({ type: 'uuid', nullable: true })
  receiverId!: string | null;

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

  @Column({ default: false })
  isSystemMessage!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}