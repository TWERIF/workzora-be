import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BidsService } from './bids.service';
import { CreateBidDto, DeleteBidDto, IdDto, ProjectIdsDto, UpdateBidDto, WonBidDto } from './dto';

@Controller()
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @MessagePattern('bids.create')
  create(@Payload() data: CreateBidDto) {
    return this.bidsService.create(data);
  }

  @MessagePattern('bids.update')
  update(@Payload() data: UpdateBidDto) {
    return this.bidsService.update(data);
  }

  @MessagePattern('bids.delete')
  deleteBid(@Payload() data: DeleteBidDto) {
    return this.bidsService.deleteBid(data);
  }

  @MessagePattern('bids.getProjectBids')
  getProjectBids(@Payload() data: IdDto) {
    return this.bidsService.getProjectBids(data);
  }

  @MessagePattern('bids.getWonBid')
  getWonBid(@Payload() data: WonBidDto) {
    return this.bidsService.getWonBid(data);
  }

  @MessagePattern('bids.countByProject')
  countByProject(@Payload() data: IdDto) {
    return this.bidsService.countByProject(data);
  }

  @MessagePattern('bids.countByProjects')
  countByProjects(@Payload() data: ProjectIdsDto) {
    return this.bidsService.countByProjects(data);
  }

  @MessagePattern('bids.getMyBids')
  getMyBids(@Payload() data: IdDto) {
    return this.bidsService.getMyBids(data);
  }
}
