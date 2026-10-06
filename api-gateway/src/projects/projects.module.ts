import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { rmqClient } from '../common/rmq';
import { ProjectsController } from './projects.controller';

@Module({
  imports: [ClientsModule.register([rmqClient('PROJECT_SERVICE'), rmqClient('SEARCH_SERVICE'), rmqClient('USER_SERVICE')])],
  controllers: [ProjectsController],
})
export class ProjectsModule {}
