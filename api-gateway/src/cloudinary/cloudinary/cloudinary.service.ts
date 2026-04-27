import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import * as streamifier from 'streamifier';
import 'multer';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
  async uploadChatAttachment(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const fileExt = file.originalname.split('.').pop()?.toLowerCase();

      const rawExtensions = [
        'pdf',
        'doc',
        'docx',
        'xls',
        'xlsx',
        'zip',
        'rar',
        'txt',
      ];
      const isRaw = rawExtensions.includes(fileExt || '');

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'workzora_chat_attachments',
          resource_type: isRaw ? 'raw' : 'auto',

          public_id: isRaw
            ? `document_${Date.now()}.${fileExt}`
            : `media_${Date.now()}`,
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error || !result) {
            console.error('Cloudinary upload error:', error);
            return reject(
              new InternalServerErrorException(
                'Помилка завантаження файлу в чат',
              ),
            );
          }
          resolve(result.secure_url);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
  async uploadAvatar(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'workzora_avatars',
          format: 'webp',
          transformation: [
            { width: 250, height: 250, crop: 'fill', gravity: 'face' },
          ],
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error || !result) {
            console.error('Cloudinary error:', error);
            return reject(
              new InternalServerErrorException('Помилка завантаження файлу'),
            );
          }
          resolve(result.secure_url);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}
