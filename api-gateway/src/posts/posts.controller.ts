import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Param, Post, Put, Query, Req, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { firstValueFrom } from 'rxjs';
import { Roles, RolesGuard } from '../auth/guards/role-guard';
import { Public } from '../auth/public.decorator';
import { sendRpc } from '../common/rpc';
import { CloudinaryService } from '../cloudinary/cloudinary/cloudinary.service';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostsDto } from './dto/get-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
@UseGuards(RolesGuard)
export class PostsController {
    constructor(
        @Inject('POSTS_SERVICE')
        private readonly postsClient: ClientProxy,
        private readonly cloudinaryService: CloudinaryService,
        @Inject('SEARCH_SERVICE') private readonly searchClient: ClientProxy,
    ) { }

    @Get('search')
    @Public()
    async searchPosts(@Query('searchTerm') searchTerm: string) {
        if (!searchTerm || searchTerm.trim() === '') {
            return [];
        }

        try {
            return await firstValueFrom(
                this.searchClient.send('posts.search', { searchTerm }),
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
    @Roles('admin')
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


    // Images placed inside the article body by the admin editor
    @Post('images')
    @Roles('admin')
    @UseInterceptors(
        FileInterceptor('image', { limits: { fileSize: 10 * 1024 * 1024 } })
    )
    async uploadArticleImage(
        @UploadedFile() file: Express.Multer.File
    ) {
        if (!file || !file.mimetype?.startsWith('image/')) {
            throw new HttpException('Image file is required', HttpStatus.BAD_REQUEST);
        }
        const url = await this.cloudinaryService.uploadAnyDocument(
            file, "workzora_posts"
        );
        return { url };
    }


    @Put(':id')
    @Roles('admin')
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
        return this.postsClient.send(
            'posts.update',
            {
                id,
                ...dto,
            },
        );
    }


    @Delete(':id')
    @Roles('admin')
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
        @Param('id') idOrSlug: string,
    ) {
        return sendRpc(this.postsClient, 'posts.getOne', { id: idOrSlug });
    }
}