import { Type } from 'class-transformer';
import { IsIn, IsInt, IsObject, IsOptional, IsString, IsUUID, Matches, Max, MaxLength, Min } from 'class-validator';
import { NOTIFICATION_TYPES, type NotificationParams, type NotificationType } from './entities/notification.entity';

export class CreateNotificationDto {
  @IsUUID()
  userId!: string;

  @IsIn(NOTIFICATION_TYPES)
  type!: NotificationType;

  @Matches(/^[a-zA-Z]+$/)
  @MaxLength(60)
  key!: string;

  @IsOptional()
  @IsObject()
  params?: NotificationParams;

  @IsOptional()
  @IsString()
  @Matches(/^\/[^\s]*$/)
  @MaxLength(300)
  link?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  dedupeKey?: string;
}

export class UserDto {
  @IsUUID()
  userId!: string;
}

export class ListNotificationsDto extends UserDto {
  @IsOptional()
  @IsIn(NOTIFICATION_TYPES)
  type?: NotificationType;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit = 10;
}

export class MarkReadDto extends UserDto {
  @IsUUID()
  id!: string;
}

export class MarkAllReadDto extends UserDto {
  @IsOptional()
  @IsIn(NOTIFICATION_TYPES)
  type?: NotificationType;
}
