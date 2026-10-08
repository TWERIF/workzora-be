import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUrl, IsUUID, Max, MaxLength, Min, ValidateIf } from 'class-validator';

export class ProjectIdDto {
  @IsUUID()
  projectId!: string;
}

export class ChatAccessDto {
  @ValidateIf((dto: ChatAccessDto) => !dto.projectId)
  @IsUUID()
  chatId?: string;

  @ValidateIf((dto: ChatAccessDto) => !dto.chatId)
  @IsUUID()
  projectId?: string;
}

export class SaveMessageDto {
  @IsUUID()
  chatId!: string;

  @IsUUID()
  senderId!: string;

  @IsString()
  @MaxLength(10000)
  content!: string;

  @IsOptional()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  fileUrl?: string;
}

export class GetMessagesDto {
  @IsUUID()
  chatId!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  amount?: number;
}

export class MarkAsReadDto {
  @IsUUID()
  messageId!: string;

  @IsUUID()
  userId!: string;
}

export class ChatListDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
