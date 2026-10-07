import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BlockDto, BlockerDto, BlockStatusDto } from './dto';
import { BlocksService } from './blocks.service';

@Controller()
export class BlocksController {
  constructor(private readonly blocks: BlocksService) {}

  @MessagePattern('users.block')
  block(@Payload() dto: BlockDto) {
    return this.blocks.block(dto);
  }

  @MessagePattern('users.unblock')
  unblock(@Payload() dto: BlockDto) {
    return this.blocks.unblock(dto);
  }

  @MessagePattern('users.blockedList')
  list(@Payload() dto: BlockerDto) {
    return this.blocks.list(dto.userId);
  }

  @MessagePattern('users.blockStatus')
  status(@Payload() dto: BlockStatusDto) {
    return this.blocks.status(dto);
  }
}
