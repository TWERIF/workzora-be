import { IsString } from "class-validator";

export class CardDto {
    @IsString()
    cardNumber!: string;
}