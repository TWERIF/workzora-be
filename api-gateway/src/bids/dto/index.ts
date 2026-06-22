import { IsNumber, IsString } from 'class-validator';

export class CreateBidDto {
    @IsString()
    projectId?: string;

    @IsString()
    description?: string;

    @IsNumber()
    price?: number;

    @IsNumber()
    time?: number;
}