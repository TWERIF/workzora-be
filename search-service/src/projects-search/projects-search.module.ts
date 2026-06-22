import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchProject } from './entities/project.entity';
import { ProjectsSearchController } from './projects-search.controller';
import { SearchService } from './projects-search.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SearchProject]),
    ClientsModule.register([
      {
        name: 'PROJECTS_SERVICE_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://rabbitmq:5672'],
          queue: 'projects_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),],
  providers: [SearchService],
  controllers: [ProjectsSearchController]
})
export class ProjectsSearchModule { }
