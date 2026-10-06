import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';

export const REVIEW_CRITERIA = ['quality', 'professionalism', 'communication', 'price', 'deadlines'] as const;
export type ReviewCriterion = (typeof REVIEW_CRITERIA)[number];

// A review one party of a finished project leaves about the other one.
// Both the client and the freelancer can review each other once per project.
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

  // role of the author in the project: 'client' reviews a freelancer and vice versa
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

  // average of the five criteria
  @Column({ type: 'float' })
  rating!: number;

  @Column({ type: 'text' })
  text!: string;

  // only for the platform team, never returned by public queries
  @Column({ type: 'text', nullable: true, select: false })
  privateFeedback!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
