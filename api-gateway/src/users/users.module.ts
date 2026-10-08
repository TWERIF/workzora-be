import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ClientsModule } from '@nestjs/microservices';
import { rmqClient } from '../common/rmq';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryService } from '../cloudinary/cloudinary/cloudinary.service';

@Module({
  imports: [
    ClientsModule.register([
      rmqClient('KYC_SERVICE'),
      rmqClient('PROJECT_SERVICE'),
      rmqClient('USER_SERVICE'),
      rmqClient('BIDS_SERVICE'),
      rmqClient('INVOICES_SERVICE'),
    ]),
    AuthModule,
  ],
  providers: [UsersService, CloudinaryService],
  controllers: [UsersController],
})
export class UsersModule {}
