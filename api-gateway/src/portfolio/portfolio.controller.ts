import {
    Body,
    Controller,
    Delete,
    Get,
    Inject,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    Req,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { firstValueFrom } from 'rxjs';
import { CloudinaryService } from '../cloudinary/cloudinary/cloudinary.service';
import { CreatePortfolioDto, UpdatePortfolioDto } from './dto';
import { Public } from '../auth/public.decorator';

@Controller('portfolio')
export class PortfolioController {
    constructor(
        @Inject('PORTFOLIO_SERVICE')
        private readonly portfolioClient: ClientProxy,

        private readonly cloudinaryService: CloudinaryService,
    ) { }

    @Post()
    @UseInterceptors(FileInterceptor('image'))
    async create(
        @Req() req,
        @Body() dto: CreatePortfolioDto,
        @UploadedFile() file: Express.Multer.File,
    ) {
        const imageUrl = await this.cloudinaryService.uploadAnyDocument(
            file,
            'portfolio',
        );

        return firstValueFrom(
            this.portfolioClient.send('portfolio.create', {
                ...dto,
                userId: req.user.id,
                imageUrl,
            }),
        );
    }

    @Patch(':id')
    @UseInterceptors(FileInterceptor('image'))
    async update(
        @Param('id') id: string,
        @Req() req,
        @Body() dto: UpdatePortfolioDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        let imageUrl = dto.imageUrl;

        if (file) {
            imageUrl = await this.cloudinaryService.uploadAnyDocument(
                file,
                'portfolio',
            );
        }

        return firstValueFrom(
            this.portfolioClient.send('portfolio.update', {
                ...dto,
                id,
                userId: req.user.id,
                imageUrl,
            }),
        );
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return firstValueFrom(
            this.portfolioClient.send('portfolio.delete', id),
        );
    }

    @Get('me')
    async findMy(@Req() req) {
        return firstValueFrom(
            this.portfolioClient.send(
                'portfolio.findByUserId',
                req.user.id,
            ),
        );
    }

    @Get()
    @Public()
    async findAll(
        @Query('page', ParseIntPipe) page = 1,
        @Query('limit', ParseIntPipe) limit = 10,
    ) {
        return firstValueFrom(
            this.portfolioClient.send('portfolio.findAll', {
                page,
                limit,
            }),
        );
    }
}