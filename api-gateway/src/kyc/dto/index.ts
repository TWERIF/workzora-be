import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export const VERIFICATION_STATUSES = ['not_verified', 'in_progress', 'verified'] as const;

export class UpdateVerificationStatusDto {
  @ApiProperty({ enum: VERIFICATION_STATUSES })
  @IsIn(VERIFICATION_STATUSES)
  status!: (typeof VERIFICATION_STATUSES)[number];
}
