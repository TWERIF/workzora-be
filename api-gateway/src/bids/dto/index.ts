import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateBidDto {
  @ApiProperty()
  @IsUUID()
  projectId!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  description!: string;

  @ApiProperty({ description: 'USD' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  price!: number;

  @ApiProperty({ description: 'Days' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  time!: number;
}

export class UpdateBidDto extends PartialType(OmitType(CreateBidDto, ['projectId'] as const)) {}
