import {
    Column,
    Entity,
    PrimaryGeneratedColumn
} from 'typeorm';


@Entity({ name: 'search_posts' })
export class SearchPost {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    title!: string;

    @Column()
    teaser!: string;

    @Column()
    tag!: string;

    @Column({
        type: 'tsvector',
        select: false,
        insert: false,
        update: false
    })
    search_vector: any;
}