import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ApiConsumes, ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';
import { CloudinaryService } from '../cloudinary/cloudinary/cloudinary.service';
import { CurrentUser } from '../common/auth-user';
import type { AuthUser } from '../common/auth-user';
import { assertImage, IMAGE_UPLOAD_LIMIT } from '../common/files';
import { PaginationQueryDto } from '../common/pagination.dto';
import { sendRpc } from '../common/rpc';
import { CreatePortfolioDto, parseTags, UpdatePortfolioDto } from './dto';

@ApiTags('portfolio')
@Controller('portfolio')
export class PortfolioController {
  constructor(
    @Inject('PORTFOLIO_SERVICE') private readonly portfolioClient: ClientProxy,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @ApiCookieAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Add a portfolio item with an image' })
  @UseInterceptors(FileInterceptor('image', { limits: IMAGE_UPLOAD_LIMIT }))
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreatePortfolioDto,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    const imageUrl = await this.cloudinaryService.uploadAnyDocument(assertImage(file, 'image'), 'portfolio');
    return sendRpc(this.portfolioClient, 'portfolio.create', { ...dto, tags: parseTags(dto.tags), userId: user.id, imageUrl });
  }

  @Patch(':id')
  @ApiCookieAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Edit own portfolio item' })
  @UseInterceptors(FileInterceptor('image', { limits: IMAGE_UPLOAD_LIMIT }))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdatePortfolioDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imageUrl = file ? await this.cloudinaryService.uploadAnyDocument(assertImage(file, 'image'), 'portfolio') : undefined;
    return sendRpc(this.portfolioClient, 'portfolio.update', { ...dto, tags: parseTags(dto.tags), id, userId: user.id, imageUrl });
  }

  @Delete(':id')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Delete own portfolio item' })
  delete(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    return sendRpc(this.portfolioClient, 'portfolio.delete', { id, userId: user.id });
  }

  @Post(':id/view')
  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @HttpCode(200)
  @ApiOperation({ summary: 'Count a view of a portfolio item' })
  addView(@Param('id', ParseUUIDPipe) id: string) {
    return sendRpc(this.portfolioClient, 'portfolio.addView', { id });
  }

  @Get('me')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Own portfolio' })
  findMy(@CurrentUser() user: AuthUser) {
    return sendRpc(this.portfolioClient, 'portfolio.findByUserId', { userId: user.id });
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Portfolio of a user' })
  getByUserId(@Param('id', ParseUUIDPipe) id: string) {
    return sendRpc(this.portfolioClient, 'portfolio.findByUserId', { userId: id });
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Latest portfolio items' })
  findAll(@Query() query: PaginationQueryDto) {
    return sendRpc(this.portfolioClient, 'portfolio.findAll', query);
  }
}
