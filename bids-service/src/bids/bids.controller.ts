import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BidsService } from './bids.service';
import type { DeleteBid, Id } from './dto';
import { Bid } from './entities/bid.entity';

@Controller('bids')
export class BidsController {
    constructor(
        private readonly bidsService: BidsService
    ) { }
    @MessagePattern('bids.delete')
    deleteBid(@Payload() data: DeleteBid) {
        return this.bidsService.deleteBid(data);
    }

    @MessagePattern('bids.getProjectBids')
    getProjectBids(@Payload() data: Id) {
        return this.bidsService.getProjectBids(data);
    }

    @MessagePattern('bids.getMyBids')
    getMyBids(@Payload() data: Id) {
        return this.bidsService.getMyBids(data);
    }

    @MessagePattern('bids.update')
    update(@Payload() data: Partial<Bid>) {
        return this.bidsService.update(data);
    }

    @MessagePattern('bids.create')
    create(@Payload() data: Partial<Bid>) {
        
        return this.bidsService.create(data);
    }

}
