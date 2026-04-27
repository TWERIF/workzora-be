import { UserRole } from '../../types';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'users', schema: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  reserveEmail!: string;

  @Column()
  password!: string;

  @Column({ default: '' })
  username!: string;

  @Column({ default: '' })
  firstName!: string;

  @Column({ default: '' })
  lastName!: string;

  @Column({ default: UserRole.FREELANCER, enum: UserRole })
  role!: string;

  @Column({ default: false })
  isActive!: boolean;

  @Column('simple-array', { default: '' })
  skills!: string[];

  @Column({ type: 'float', default: 0 })
  ratings!: number;

  @Column({ default: '' })
  position!: string;

  @Column({ type: 'decimal', default: 0 })
  rates!: number;

  @Column({ nullable: true })
  avatarUrl!: string;
}
