import {
    Column,
    Entity,
    ManyToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';

@Entity({ name: 'categories', schema: 'category' })
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    title!: string;

    @Column({ type: 'text' })
    description!: string;

    @ManyToMany(() => Project, (project) => project.categories)
    projects!: Project[];

    count?: number;
}