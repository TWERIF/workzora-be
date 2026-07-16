import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { EmailData } from '../types';
import { SenderService } from './sender.service';

@Controller()
export class SenderController {
    private readonly logger = new Logger(SenderController.name);

    constructor(private readonly senderService: SenderService) { }

    @MessagePattern('send_email')
    async send(@Payload() data: EmailData) {
        try {
            return await this.senderService.send(data);
        } catch (error) {
            this.logger.error('Не вдалося відправити лист', error);
            throw error;
        }
    }
}