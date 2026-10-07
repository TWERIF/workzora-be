import { IsUUID } from 'class-validator';

export class BlockDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  blockedId!: string;
}

export class BlockerDto {
  @IsUUID()
  userId!: string;
}

export class BlockStatusDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  otherId!: string;
}
