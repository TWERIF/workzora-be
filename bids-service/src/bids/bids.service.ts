import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { rpcError } from '../common/rpc-validation.pipe';
import { CreateBidDto, DeleteBidDto, IdDto, ProjectIdsDto, UpdateBidDto, WonBidDto } from './dto';
import { Bid } from './entities/bid.entity';

@Injectable()
export class BidsService {
  constructor(
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
  ) {}

  async create(data: CreateBidDto) {
    const existing = await this.bidRepository.findOne({ where: { projectId: data.projectId, userId: data.userId } });
    if (existing) throw rpcError(HttpStatus.CONFLICT, 'Bid already exists');

    return this.bidRepository.save(this.bidRepository.create(data));
  }

  async update({ id, userId, ...changes }: UpdateBidDto) {
    const bid = await this.bidRepository.findOne({ where: { id } });
    if (!bid) throw rpcError(HttpStatus.NOT_FOUND, 'Bid not found');
    if (bid.userId !== userId) throw rpcError(HttpStatus.FORBIDDEN, 'Only the author can edit the bid');
    if (bid.maxEdits <= 0) throw rpcError(HttpStatus.BAD_REQUEST, 'Edit limit reached');

    Object.assign(bid, changes, { maxEdits: bid.maxEdits - 1 });
    return this.bidRepository.save(bid);
  }

  async deleteBid({ id, userId }: DeleteBidDto) {
    const bid = await this.bidRepository.findOne({ where: { id } });
    if (!bid) throw rpcError(HttpStatus.NOT_FOUND, 'Bid not found');
    if (bid.userId !== userId) throw rpcError(HttpStatus.FORBIDDEN, 'Only the author can delete the bid');

    await this.bidRepository.delete({ id });
    return { success: true };
  }

  getProjectBids({ id }: IdDto) {
    return this.bidRepository.find({ where: { projectId: id }, order: { createdAt: 'DESC' } });
  }

  getMyBids({ id }: IdDto) {
    return this.bidRepository.find({ where: { userId: id }, order: { createdAt: 'DESC' } });
  }

  getWonBid({ id, freelancerId }: WonBidDto) {
    return this.bidRepository.findOne({ where: { projectId: id, userId: freelancerId } });
  }

  countByProject({ id }: IdDto) {
    return this.bidRepository.count({ where: { projectId: id } });
  }

  async countByProjects({ ids }: ProjectIdsDto) {
    if (!ids.length) return {};

    const rows = await this.bidRepository
      .createQueryBuilder('bid')
      .select('bid.projectId', 'projectId')
      .addSelect('COUNT(*)', 'count')
      .where('bid.projectId IN (:...ids)', { ids })
      .groupBy('bid.projectId')
      .getRawMany<{ projectId: string; count: string }>();

    return Object.fromEntries(rows.map((row) => [row.projectId, Number(row.count)]));
  }
}
