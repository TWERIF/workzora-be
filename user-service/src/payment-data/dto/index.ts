import { IsString } from "class-validator";

export class CardDto {
    @IsString()
    userId!: string;

    @IsString()
    cardNumber!: string;
}