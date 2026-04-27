import { IsString, IsOptional, IsUUID } from 'class-validator';

export class SaveMessageDto {
  @IsUUID()
  senderId!: string;

  @IsUUID()
  @IsOptional()
  receiverId?: string;

  @IsString()
  content!: string;

  @IsUUID()
  projectId!: string;

  @IsString()
  @IsOptional()
  fileUrl?: string;
}
