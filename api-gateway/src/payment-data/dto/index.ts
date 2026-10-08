import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, Matches, registerDecorator, ValidationOptions } from 'class-validator';

const passesLuhn = (digits: string) => {
  let sum = 0;
  for (let index = 0; index < digits.length; index++) {
    let digit = Number(digits[digits.length - 1 - index]);
    if (index % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
};

function IsCardNumber(options?: ValidationOptions) {
  return (target: object, propertyName: string) =>
    registerDecorator({
      name: 'isCardNumber',
      target: target.constructor,
      propertyName,
      options: { message: 'Invalid card number', ...options },
      validator: {
        validate: (value: unknown) => typeof value === 'string' && passesLuhn(value),
      },
    });
}

export class CardDto {
  @ApiProperty({ example: '4111111111111111' })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.replace(/\s/g, '') : value))
  @Matches(/^\d{12,19}$/, { message: 'Card number must contain 12 to 19 digits' })
  @IsCardNumber()
  cardNumber!: string;
}

export class AddCardDto extends CardDto {
  @ApiPropertyOptional({ example: '08/28', description: 'MM/YY' })
  @IsOptional()
  @Matches(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: 'Expiry must look like MM/YY' })
  expiry?: string;
}
