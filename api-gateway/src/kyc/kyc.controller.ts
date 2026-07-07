import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Inject,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UnauthorizedException,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileFieldsInterceptor } from '@nestjs/platform-express/multer';
import { firstValueFrom } from 'rxjs';
import { CloudinaryService } from '../cloudinary/cloudinary/cloudinary.service';

@Controller('kyc')
export class KycController {
    constructor(
        private readonly cloudinaryService: CloudinaryService,
        @Inject('KYC_SERVICE') private readonly kycClient: ClientProxy,
    ) { }

    @Post()
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'documentFile', maxCount: 1 },
            { name: 'selfiFile', maxCount: 1 },
        ]),
    )
    async accountVerification(
        @UploadedFiles()
        files: {
            documentFile?: Express.Multer.File[];
            selfiFile?: Express.Multer.File[];
        },
        @Req() req,
    ) {
        const user = req.user;

        if (!user) {
            throw new UnauthorizedException(
                'Користувач не авторизований',
            );
        }

        if (!files?.documentFile?.[0] || !files?.selfiFile?.[0]) {
            throw new BadRequestException(
                'Один або обидва файли відсутні',
            );
        }

        const documentUrl = await this.cloudinaryService.uploadDocument(
            files.documentFile[0],
        );

        const selfieUrl = await this.cloudinaryService.uploadDocument(
            files.selfiFile[0],
        );

        return firstValueFrom(
            this.kycClient.send('accout-verification.create', {
                userId: user.id,
                documentUrl,
                selfieUrl,
            }),
        );
    }

    @Get()
    async findAll(
        @Query('page') page = 1,
        @Query('limit') limit = 10,
    ) {
        return firstValueFrom(
            this.kycClient.send('accout-verification.findAll', {
                page: Number(page),
                limit: Number(limit),
            }),
        );
    }

    @Get('me')
    async findMyVerification(@Req() req) {
        const user = req.user;

        if (!user) {
            throw new UnauthorizedException(
                'Користувач не авторизований',
            );
        }

        return firstValueFrom(
            this.kycClient.send(
                'accout-verification.findOneByUserId',
                {
                    userId: user.id,
                },
            ),
        );
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return firstValueFrom(
            this.kycClient.send('accout-verification.findOne', {
                id,
            }),
        );
    }

    @Patch(':id/status')
    async updateStatus(
        @Param('id') id: string,
        @Body() body: { status: string },
    ) {
        return firstValueFrom(
            this.kycClient.send(
                'accout-verification.updateStatus',
                {
                    id,
                    status: body.status,
                },
            ),
        );
    }
}