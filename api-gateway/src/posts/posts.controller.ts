import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles, RolesGuard } from '../auth/guards/role-guard';
import { Public } from '../auth/public.decorator';
import { CloudinaryService } from '../cloudinary/cloudinary/cloudinary.service';
import { CurrentUser } from '../common/auth-user';
import type { AuthUser } from '../common/auth-user';
import { assertImage, IMAGE_UPLOAD_LIMIT } from '../common/files';
import { sendRpc } from '../common/rpc';
import { CreatePostDto, PostsQueryDto, SearchPostsQueryDto, UpdatePostDto } from './dto';

const POSTS_FOLDER = 'workzora_posts';

@ApiTags('posts')
@Controller('posts')
@UseGuards(RolesGuard)
export class PostsController {
  constructor(
    @Inject('POSTS_SERVICE') private readonly postsClient: ClientProxy,
    @Inject('SEARCH_SERVICE') private readonly searchClient: ClientProxy,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get('search')
  @Public()
  @ApiOperation({ summary: 'Search articles' })
  searchPosts(@Query() query: SearchPostsQueryDto) {
    if (!query.searchTerm?.trim()) return [];
    return sendRpc(this.searchClient, 'posts.search', { searchTerm: query.searchTerm });
  }

  @Post()
  @Roles('admin')
  @ApiCookieAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create an article with a cover (admin)' })
  @UseInterceptors(FileInterceptor('imageUrl', { limits: IMAGE_UPLOAD_LIMIT }))
  async create(
    @Body() dto: CreatePostDto,
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    const imageUrl = await this.cloudinaryService.uploadAnyDocument(assertImage(file, 'imageUrl'), POSTS_FOLDER);
    return sendRpc(this.postsClient, 'posts.create', { ...dto, userId: user.id, imageUrl });
  }

  @Post('images')
  @Roles('admin')
  @ApiCookieAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { image: { type: 'string', format: 'binary' } } } })
  @ApiOperation({ summary: 'Upload an image for the article body (admin)' })
  @UseInterceptors(FileInterceptor('image', { limits: IMAGE_UPLOAD_LIMIT }))
  async uploadArticleImage(@UploadedFile() file: Express.Multer.File | undefined) {
    const url = await this.cloudinaryService.uploadAnyDocument(assertImage(file, 'image'), POSTS_FOLDER);
    return { url };
  }

  @Put(':id')
  @Roles('admin')
  @ApiCookieAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Edit an article (admin)' })
  @UseInterceptors(FileInterceptor('imageUrl', { limits: IMAGE_UPLOAD_LIMIT }))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePostDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imageUrl = file
      ? await this.cloudinaryService.uploadAnyDocument(assertImage(file, 'imageUrl'), POSTS_FOLDER)
      : dto.imageUrl;
    return sendRpc(this.postsClient, 'posts.update', { ...dto, id, imageUrl });
  }

  @Delete(':id')
  @Roles('admin')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Delete an article (admin)' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return sendRpc(this.postsClient, 'posts.delete', { id });
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Articles, newest first, with a topic filter' })
  getAll(@Query() query: PostsQueryDto) {
    return sendRpc(this.postsClient, 'posts.getAll', query);
  }

  @Get('popular')
  @Public()
  @ApiOperation({ summary: 'Five most read articles' })
  getPopular() {
    return sendRpc(this.postsClient, 'posts.popular', {});
  }

  @Post(':id/view')
  @Public()
  @ApiOperation({ summary: 'Count an article view' })
  addView(@Param('id', ParseUUIDPipe) id: string) {
    return sendRpc(this.postsClient, 'posts.view', { id });
  }

  @Get('latest')
  @Public()
  @ApiOperation({ summary: 'Three latest articles' })
  getLatestThree() {
    return sendRpc(this.postsClient, 'posts.latestThree', {});
  }

  @Get(':idOrSlug')
  @Public()
  @ApiOperation({ summary: 'Article by id or slug' })
  getOne(@Param('idOrSlug') idOrSlug: string) {
    return sendRpc(this.postsClient, 'posts.getOne', { id: idOrSlug });
  }
}
