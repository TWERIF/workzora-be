import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Req } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateBidDto } from './dto';
import { firstValueFrom } from 'rxjs';

@Controller('bids')
export class BidsController {
    constructor(
        @Inject('BIDS_SERVICE')
        private readonly bidsClient: ClientProxy,
        @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    ) { }

    @Post()
    async create(@Body() data: CreateBidDto, @Req() req) {
        return await firstValueFrom(this.bidsClient.send('bids.create', { ...data, userId: req.user.id }));
    }

    @Get('project/:id')
    async getProjectBids(@Param('id') id: string) {
        const bids = await firstValueFrom(this.bidsClient.send('bids.getProjectBids', { id }));
        const userIds = [...new Set(bids.map(b => b.userId))];

        const users = await firstValueFrom(
            this.userClient.send('users.getMany', userIds)
        );

        const usersMap = new Map(users.map(user => [user.id, user]));

        return bids.map(bid => ({
            ...bid,
            user: usersMap.get(bid.userId),
        }));
    }

    @Get('my')
    getMyBids(@Req() req) {
        const user = req.user;
        return this.bidsClient.send('bids.getMyBids', { id: user.id });
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() data: Partial<CreateBidDto>, @Req() req) {
        return this.bidsClient.send('bids.update', { id, ...data, userId: req.user.id });
    }

    @Delete(':id')
    deleteBid(@Param('id') id: string, @Req() req) {
        return this.bidsClient.send('bids.delete', { id, userId: req.user.id });
    }
}