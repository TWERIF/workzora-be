import { Body, Controller, Get, HttpException, Inject, Param, Post, Put, Query, Req } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Roles } from '../auth/guards/role-guard';
import { CardDto } from './dto';

@Controller('payment-data')
export class PaymentDataController {
    constructor(
        @Inject('PAYMENT_DATA_SERVICE') private readonly paymentDataClient: ClientProxy,
        @Inject('PROJECT_SERVICE') private readonly projectClient: ClientProxy,
    ) { }

    @Roles("admin")
    @Get("get-many")
    async getMany(@Req() req, @Query('page') page = 1, @Query('limit') limit = 10) {
        const user = req.user;
        if (!user) return;

        return await firstValueFrom(
            this.projectClient.send("payments.findMany", {
                id: user.id,
                role: user.role,
                page,
                limit,
            })
        )
    }

    @Roles("admin")
    @Get("get-one/:id")
    async getOne(@Param("id") id: string) {

        return await firstValueFrom(
            this.projectClient.send("payments.findOne", {
                id
            })
        )
    }

    @Post()
    async create(@Body() data: CardDto, @Req() req) {
        try {
            const userId = req.user.id;
            return await firstValueFrom(
                this.paymentDataClient.send('paymentData.create', { ...data, userId }),
            );
        } catch (err) {
            throw new HttpException((err as Error).message ?? 'Payment create failed', 400);
        }
    }

    @Put()
    async update(@Body() data: CardDto, @Req() req) {
        try {
            const userId = req.user.id;
            return await firstValueFrom(this.paymentDataClient.send('paymentData.update', { ...data, userId }));
        } catch (err) {
            throw new HttpException((err as Error).message ?? 'Payment update failed', 400);
        }
    }

    @Get(':userId')
    async getPaymentData(@Param('userId') userId: string) {
        return await firstValueFrom(
            this.paymentDataClient.send('paymentData.getByUserId', { userId }),
        );
    }
}