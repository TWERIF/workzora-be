import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostsDto } from './dto/get-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

@Controller()
export class PostsController {
    constructor(
        private readonly postsService: PostsService,
    ) { }


    @MessagePattern('posts.create')
    async create(
        @Payload() dto: CreatePostDto,
    ) {
        return await this.postsService.create(dto);
    }

    @MessagePattern('posts.findManyByIds')
    async findManyByIds(@Payload() data: { ids: string[] }) {
        return await this.postsService.findManyByIds(data.ids);
    }

    @MessagePattern('posts.update')
    async update(
        @Payload()
        dto: UpdatePostDto,
    ) {
        return await this.postsService.update(
            dto
        );
    }


    @MessagePattern('posts.delete')
    async delete(
        @Payload()
        payload: {
            id: string;
        },
    ) {
        return await this.postsService.delete(payload.id);
    }


    @MessagePattern('posts.getAll')
    async getAll(
        @Payload() dto: GetPostsDto,
    ) {
        return await this.postsService.getAll(
            dto.page,
            dto.limit,
        );
    }


    @MessagePattern('posts.latestThree')
    async getLatestThree() {
        return await this.postsService.getLatestThree();
    }


    @MessagePattern('posts.getOne')
    async getOne(
        @Payload()
        payload: {
            id: string;
        },
    ) {
        return await this.postsService.getOne(payload.id);
    }
}