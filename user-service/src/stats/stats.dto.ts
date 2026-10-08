import { IsISO8601, Matches } from 'class-validator';

export class VisitDto {
  @Matches(/^[A-Za-z0-9-]{8,64}$/)
  visitorId!: string;
}

export class StatsRangeDto {
  @IsISO8601()
  from!: string;

  @IsISO8601()
  to!: string;
}
