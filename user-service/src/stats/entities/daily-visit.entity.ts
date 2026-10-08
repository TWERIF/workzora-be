import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'daily_visits', schema: 'analytics' })
@Index(['day', 'visitorId'], { unique: true })
export class DailyVisit {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'date' })
  day!: string;

  @Column({ type: 'varchar', length: 64 })
  visitorId!: string;

  @Column({ type: 'int', default: 1 })
  views!: number;
}
