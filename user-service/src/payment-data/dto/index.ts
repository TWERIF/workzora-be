import { IsUUID, Matches } from 'class-validator';

export class CardDto {
  @IsUUID()
  userId!: string;

  @Matches(/^\d{12,19}$/)
  cardNumber!: string;
}

export class UserIdDto {
  @IsUUID()
  userId!: string;
}
