import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Availability, PreferredBudgetType, PreferredProjectSize, UserRole, WorkType } from '../../types';

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

  @Column({ type: 'decimal', default: 0 })
  rate!: number;

  @Column({
    type: 'enum',
    enum: WorkType,
    nullable: true,
  })
  workType!: WorkType;

  @Column({
    type: 'enum',
    enum: PreferredBudgetType,
    nullable: true,
  })
  preferredBudgetType!: PreferredBudgetType;

  @Column({
    type: 'enum',
    enum: PreferredProjectSize,
    nullable: true,
  })
  preferredProjectSize!: PreferredProjectSize;

  @Column({
    type: 'enum',
    enum: Availability,
    default: Availability.AVAILABLE,
  })
  availability!: Availability;

  @Column({ type: 'varchar', length: 20, default: 'STANDARD' })
  rateType!: string;

  @Column({ type: 'varchar', length: 200, default: '' })
  rateNote!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  projectType!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  budgetRange!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  workFormat!: string | null;

  @Column({nullable: true})
  phone!: string;

  @Column({nullable: true})
  city!: string;

  @Column({nullable: true})
  country!: string;

  @Column({ type: 'varchar', nullable: true })
  avatarUrl!: string | null;

  @Column({ type: 'text', default: '' })
  bio!: string;

  @Column({ type: 'timestamptz', nullable: true })
  createdAt!: Date | null;

  @Column({ default: false })
  roleSelected!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  roleSwitchedAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastSeenAt!: Date | null;

  @BeforeInsert()
  setCreatedAt() {
    this.createdAt = new Date();
  }
}
