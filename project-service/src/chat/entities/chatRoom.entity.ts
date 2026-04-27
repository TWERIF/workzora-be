import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Message } from './message.entity';
import { Project } from '../../projects/entities/project.entity';

@Entity({ name: 'chat_rooms', schema: 'project' })
export class ChatRoom {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => Project, (project) => project.chatRoom, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'projectId' })
  project!: Project;

  @Column({ type: 'uuid' })
  projectId!: string;

  @OneToMany(() => Message, (message) => message.chatRoom)
  messages!: Message[];

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
