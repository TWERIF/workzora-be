import { IsOptional, IsUUID, Matches } from 'class-validator';

export class UserIdDto {
  @IsUUID()
  userId!: string;
}

export class CardDto extends UserIdDto {
  @Matches(/^\d{12,19}$/)
  cardNumber!: string;
}

export class AddCardDto extends CardDto {
  @IsOptional()
  @Matches(/^(0[1-9]|1[0-2])\/\d{2}$/)
  expiry?: string;
}

export class CardRefDto extends UserIdDto {
  @IsUUID()
  id!: string;
}

export class FullCardDto extends UserIdDto {
  @IsOptional()
  @IsUUID()
  cardId?: string;
}
