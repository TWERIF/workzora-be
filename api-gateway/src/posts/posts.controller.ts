import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Param, Post, Put, Query, Req, UnauthorizedException, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { firstValueFrom } from 'rxjs';
import { Public } from '../auth/public.decorator';
import { CloudinaryService } from '../cloudinary/cloudinary/cloudinary.service';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostsDto } from './dto/get-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
export class PostsController {
    constructor(
        @Inject('POSTS_SERVICE')
        private readonly postsClient: ClientProxy,
        private readonly cloudinaryService: CloudinaryService,
        @Inject('SEARCH_SERVICE') private readonly searchClient: ClientProxy,
    ) { }

    @Get('search')
    @Public()
    async searchProjects(@Query('searchTerm') searchTerm: string) {
        if (!searchTerm || searchTerm.trim() === '') {
            return [];
        }

        try {
            return await firstValueFrom(
                this.searchClient.send('projects.search', { searchTerm }),
            );
        } catch (error) {
            console.error('Search Service Error:', error);
            throw new HttpException(
                'Search service is temporarily unavailable',
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }
    }


    @Post()
    @UseInterceptors(
        FileInterceptor('imageUrl')
    )
    async create(
        @Body() dto: CreatePostDto,
        @Req() req,
        @UploadedFile() file: Express.Multer.File
    ) {
        const user = req.user;
        if (!user) throw new UnauthorizedException("User error");
        const imageUrl = await this.cloudinaryService.uploadAnyDocument(
            file, "workzora_posts"
        );
        return this.postsClient.send(
            'posts.create',
            {
                ...dto,
                userId: user.id,
                imageUrl
            },
        );
    }


    @Put(':id')
    @UseInterceptors(
        FileInterceptor('imageUrl')
    )
    async update(
        @Param('id') id: string,
        @Body() dto: UpdatePostDto,
        @Req() req,
        @UploadedFile() file?: Express.Multer.File
    ) {
        const user = req.user;
        if (!user) throw new UnauthorizedException();

        if (file) {
            const imageUrl = await this.cloudinaryService.uploadAnyDocument(
                file, "workzora_posts"
            );

            return this.postsClient.send(
                'posts.update',
                {
                    id,
                    ...dto,
                    imageUrl
                },
            );
        }
        console.log({
            id,
            ...dto,
            userId: user.id
        })
        return this.postsClient.send(
            'posts.update',
            {
                id,
                ...dto,
            },
        );
    }


    @Delete(':id')
    async delete(
        @Param('id') id: string,
    ) {
        return this.postsClient.send(
            'posts.delete',
            {
                id,
            },
        );
    }


    @Get()
    @Public()
    async getAll(
        @Query() dto: GetPostsDto,
    ) {
        return this.postsClient.send(
            'posts.getAll',
            dto,
        );
    }


    @Get('latest')
    @Public()
    async getLatestThree() {
        return this.postsClient.send(
            'posts.latestThree',
            {},
        );
    }


    @Get(':id')
    @Public()
    async getOne(
        @Param('id') id: string,
    ) {
        return this.postsClient.send(
            'posts.getOne',
            {
                id,
            },
        );
    }
}