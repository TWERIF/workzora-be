import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../common/pagination.dto';

export const NOTIFICATION_TYPES = ['projects', 'messages', 'payments', 'system'] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export class NotificationsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: NOTIFICATION_TYPES })
  @IsOptional()
  @IsIn(NOTIFICATION_TYPES)
  type?: NotificationType;
}

export class MarkAllReadDto {
  @ApiPropertyOptional({ enum: NOTIFICATION_TYPES })
  @IsOptional()
  @IsIn(NOTIFICATION_TYPES)
  type?: NotificationType;
}
