import { BadRequestException } from '@nestjs/common';

const MB = 1024 * 1024;

export const IMAGE_UPLOAD_LIMIT = { fileSize: 10 * MB };
export const DOCUMENT_UPLOAD_LIMIT = { fileSize: 20 * MB };

export function assertImage(file: Express.Multer.File | undefined, field = 'file'): Express.Multer.File {
  if (!file) throw new BadRequestException(`${field} is required`);
  if (!file.mimetype?.startsWith('image/')) throw new BadRequestException(`${field} must be an image`);
  return file;
}

export function assertFile(file: Express.Multer.File | undefined, field = 'file'): Express.Multer.File {
  if (!file) throw new BadRequestException(`${field} is required`);
  return file;
}
