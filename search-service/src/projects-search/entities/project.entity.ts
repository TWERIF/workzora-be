import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'search_projects' })
export class SearchProject {
    @PrimaryColumn('uuid')
    id!: string;

    @Column()
    title!: string;

    @Column({ type: 'text' })
    description!: string;

    @Column({
        type: 'tsvector',
        select: false,
        insert: false,
        update: false
    })
    search_vector: any;
}