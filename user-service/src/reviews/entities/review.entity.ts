import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';

export const REVIEW_CRITERIA = ['quality', 'professionalism', 'communication', 'price', 'deadlines'] as const;
export type ReviewCriterion = (typeof REVIEW_CRITERIA)[number];

@Entity({ name: 'reviews', schema: 'reviews' })
@Unique(['projectId', 'authorId'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  projectId!: string;

  @Column({ default: '' })
  projectTitle!: string;

  @Column('uuid')
  authorId!: string;

  @Index()
  @Column('uuid')
  targetId!: string;

  @Column()
  authorRole!: string;

  @Column({ type: 'smallint' })
  quality!: number;

  @Column({ type: 'smallint' })
  professionalism!: number;

  @Column({ type: 'smallint' })
  communication!: number;

  @Column({ type: 'smallint' })
  price!: number;

  @Column({ type: 'smallint' })
  deadlines!: number;

  @Column({ type: 'float' })
  rating!: number;

  @Column({ type: 'text' })
  text!: string;

  @Column({ type: 'text', nullable: true, select: false })
  privateFeedback!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
