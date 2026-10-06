import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles, RolesGuard } from '../auth/guards/role-guard';
import { CloudinaryService } from '../cloudinary/cloudinary/cloudinary.service';
import { CurrentUser, UserRole } from '../common/auth-user';
import type { AuthUser } from '../common/auth-user';
import { assertImage, IMAGE_UPLOAD_LIMIT } from '../common/files';
import { PaginationQueryDto } from '../common/pagination.dto';
import { sendRpc } from '../common/rpc';
import { UpdateVerificationStatusDto } from './dto';

interface VerificationFiles {
  documentFile?: Express.Multer.File[];
  selfiFile?: Express.Multer.File[];
}

interface VerificationRecord {
  id: string;
  userId: string;
}

@ApiTags('kyc')
@ApiCookieAuth()
@Controller('kyc')
@UseGuards(RolesGuard)
export class KycController {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    @Inject('KYC_SERVICE') private readonly kycClient: ClientProxy,
  ) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        documentFile: { type: 'string', format: 'binary' },
        selfiFile: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Send an ID document and a selfie for verification' })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'documentFile', maxCount: 1 },
        { name: 'selfiFile', maxCount: 1 },
      ],
      { limits: IMAGE_UPLOAD_LIMIT },
    ),
  )
  async accountVerification(@UploadedFiles() files: VerificationFiles, @CurrentUser() user: AuthUser) {
    const document = assertImage(files?.documentFile?.[0], 'documentFile');
    const selfie = assertImage(files?.selfiFile?.[0], 'selfiFile');

    const [documentUrl, selfieUrl] = await Promise.all([
      this.cloudinaryService.uploadDocument(document),
      this.cloudinaryService.uploadDocument(selfie),
    ]);

    return sendRpc(this.kycClient, 'accout-verification.create', { userId: user.id, documentUrl, selfieUrl });
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Pending verifications (admin)' })
  findAll(@Query() query: PaginationQueryDto) {
    return sendRpc(this.kycClient, 'accout-verification.findAll', query);
  }

  @Get('me')
  @ApiOperation({ summary: 'Own verification' })
  async findMyVerification(@CurrentUser() user: AuthUser) {
    const verification = await sendRpc(this.kycClient, 'accout-verification.findOneByUserId', { userId: user.id });
    return verification ?? null;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Verification by id, for its owner or an admin' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser) {
    const verification = await sendRpc<VerificationRecord>(this.kycClient, 'accout-verification.findOne', { id });
    if (verification.userId !== user.id && user.role !== UserRole.ADMIN) throw new ForbiddenException();
    return verification;
  }

  @Patch(':id/status')
  @Roles('admin')
  @ApiOperation({ summary: 'Approve or reject a verification (admin)' })
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() body: UpdateVerificationStatusDto) {
    return sendRpc(this.kycClient, 'accout-verification.updateStatus', { id, status: body.status });
  }
}
