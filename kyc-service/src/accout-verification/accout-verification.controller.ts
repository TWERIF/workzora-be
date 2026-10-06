import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AccoutVerificationService } from './accout-verification.service';
import { CreateAccountVerificationDto, IdDto, PaginationDto, UserIdDto, VerifyAccountDto } from './dto';

@Controller()
export class AccoutVerificationController {
  constructor(private readonly accoutVerificationService: AccoutVerificationService) {}

  @MessagePattern('accout-verification.create')
  create(@Payload() body: CreateAccountVerificationDto) {
    return this.accoutVerificationService.create(body);
  }

  @MessagePattern('accout-verification.updateStatus')
  updateStatus(@Payload() body: VerifyAccountDto) {
    return this.accoutVerificationService.updateStatus(body);
  }

  @MessagePattern('accout-verification.findAll')
  findAll(@Payload() data: PaginationDto) {
    return this.accoutVerificationService.findAll(data);
  }

  @MessagePattern('accout-verification.findOne')
  findOne(@Payload() data: IdDto) {
    return this.accoutVerificationService.findOne(data.id);
  }

  @MessagePattern('accout-verification.findOneByUserId')
  findOneByUserId(@Payload() data: UserIdDto) {
    return this.accoutVerificationService.findOneByUserId(data.userId);
  }
}
