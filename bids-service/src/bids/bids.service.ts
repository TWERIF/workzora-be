import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeleteBid, Id } from './dto';
import { Bid } from './entities/bid.entity';

@Injectable()
export class BidsService {
    constructor(
        @InjectRepository(Bid)
        private readonly bidRepository: Repository<Bid>
    ) { }

    async create(data: Partial<Bid>) {
        try {
            const bid = await this.bidRepository.findOne({
                where: {
                    projectId: data.projectId,
                    userId: data.userId
                }
            })
            if (bid) throw new Error("Bid already exists");

            return await this.bidRepository.save({
                ...data
            })
        } catch (error) {
            throw error;
        }
    }
    async update(data: Partial<Bid>) {
        try {
            const bid = await this.bidRepository.findOne({
                where: {
                    id: data.id
                }
            })
            if (!bid) throw new Error("Bid doesn`t exist");
            if (!bid.maxEdits) throw new Error("Max edits limit");

            return await this.bidRepository.update({ id: data.id }, { ...data, maxEdits: bid.maxEdits-- })
        } catch (error) {
            throw error;
        }
    }
    async deleteBid(data: DeleteBid) {
        try {
            const bid = await this.bidRepository.findOne({
                where: {
                    id: data.id
                }
            })
            if (bid?.userId !== data.userId) throw new ForbiddenException();

            return await this.bidRepository.delete({ id: data.id })
        } catch (error) {
            throw error;
        }
    }
    async getProjectBids(data: Id) {
        try {
            return await this.bidRepository.find({ where: { projectId: data.id } });
        } catch (error) {
            throw error;
        }
    }
    async getMyBids(data: Id) {
        try {
            return await this.bidRepository.find({ where: { userId: data.id } });
        } catch (error) {
            throw error;
        }
    }
}
