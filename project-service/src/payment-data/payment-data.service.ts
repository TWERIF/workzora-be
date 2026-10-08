import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from '../projects/entities/project.entity';

@Injectable()
export class PaymentDataService {
    constructor(
        @Inject('PAYMENT_DATA_SERVICE') private readonly paymentDataClient: ClientProxy,
        @Inject('ESCROW_SERVICE') private readonly invoicesClient: ClientProxy,
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>,
    ) { }

    async findMany({
        id,
        role,
        page = 1,
        limit = 10,
    }: {
        id: string;
        role: string;
        page: number;
        limit: number;
    }) {
        const skip = (page - 1) * limit;
        if (role !== "admin") return;

        const [projects, total] = await this.projectRepository.findAndCount({
            where: {
                status: ProjectStatus.COMPLETED
            },
            relations: {
                categories: true,
            },
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });

        return {
            data: projects,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id: string) {
        try {
            const project = await this.projectRepository.findOne({
                where: { id }, select: {
                    id: true,
                    freelancerId: true,
                    clientId: true,
                    title: true,
                }
            });
            const paymentData = await firstValueFrom(
                this.paymentDataClient.send("paymentData.getByUserId", { userId: project?.freelancerId })
            );
            const invoice = await firstValueFrom(
                this.invoicesClient.send("invoices.getByProjectId", { id })
            )
            delete invoice.id;
            return {
                ...project,
                ...invoice,
                card: paymentData,
            }
        } catch (error) {
            throw error;
        }
    }
}
