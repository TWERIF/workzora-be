import { IsIn, IsInt, IsOptional, IsString, IsUUID, Min } from "class-validator";
export enum EscrowStatus {
    CREATED,
    HELD,
    DISPUTED,
    CAPTURED,
    PAID_OUT,
    REFUNDED,
    EXPIRED,
}

export enum WonDispute {
    CLIENT, FREELANCER
}


export class CreateEscrowDto {
    @IsInt()
    @Min(1)
    amount!: number;

    @IsInt()
    currencyCode!: number;

    @IsUUID()
    projectId!: string;

    @IsUUID()
    clientId!: string;

    @IsUUID()
    freelancerId!: string;

    @IsOptional()
    @IsString()
    description?: string;
}

export class ConfirmEscrowDto {
    @IsUUID()
    invoiceId!: string;

    @IsUUID()
    clientId!: string;
}

export class OpenDisputeDto {
    @IsUUID()
    invoiceId!: string;

    @IsUUID()
    initiatorId!: string;

    @IsString()
    reason!: string;
}

export class ResolveDisputeDto {
    @IsUUID()
    invoiceId!: string;

    @IsUUID()
    adminId!: string;

    @IsIn([WonDispute.CLIENT, WonDispute.FREELANCER])
    decision!: WonDispute;

    @IsOptional()
    @IsString()
    note?: string;
}

export class MonobankWebhookEventDto {
    @IsString()
    invoiceId!: string;

    @IsString()
    status!: string;

    @IsOptional()
    @IsInt()
    amount?: number;
}