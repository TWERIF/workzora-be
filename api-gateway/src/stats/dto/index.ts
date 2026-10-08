import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Matches, Max, Min } from 'class-validator';

export class VisitDto {
  @ApiProperty()
  @Matches(/^[A-Za-z0-9-]{8,64}$/)
  visitorId!: string;
}

export class OverviewQueryDto {
  @ApiPropertyOptional({ default: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(366)
  days: number = 30;
}
