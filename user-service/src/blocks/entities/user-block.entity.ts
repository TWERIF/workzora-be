import { CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'user_blocks', schema: 'users' })
@Index(['blockedId'])
export class UserBlock {
  @PrimaryColumn('uuid')
  userId!: string;

  @PrimaryColumn('uuid')
  blockedId!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
