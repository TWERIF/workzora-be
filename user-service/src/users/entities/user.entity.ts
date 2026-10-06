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

  @Column({nullable: true})
  phone!: string;

  @Column({nullable: true})
  city!: string;

  @Column({nullable: true})
  country!: string;

  @Column({ nullable: true })
  avatarUrl!: string;

  @Column({ type: 'text', default: '' })
  bio!: string;

  // Nullable on purpose: users created before this column existed have no known
  // registration date, and a DEFAULT now() would backfill them with the deploy date.
  @Column({ type: 'timestamptz', nullable: true })
  createdAt!: Date | null;

  // set once the user picked client/freelancer on the account-type page after sign-up
  @Column({ default: false })
  roleSelected!: boolean;

  // last client <-> freelancer switch; switching is allowed once per ROLE_SWITCH_DAYS
  @Column({ type: 'timestamptz', nullable: true })
  roleSwitchedAt!: Date | null;

  @BeforeInsert()
  setCreatedAt() {
    this.createdAt = new Date();
  }
}
