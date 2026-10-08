import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { renderCodeEmail } from '../templates/code-email';
import { CodeEmailDto, EmailData } from '../types';
import { SenderService } from './sender.service';

@Controller()
export class SenderController {
    constructor(private readonly senderService: SenderService) { }

    @MessagePattern('send_email')
    send(@Payload() data: EmailData) {
        return this.senderService.send(data);
    }

    @MessagePattern('send_code_email')
    sendCode(@Payload() data: CodeEmailDto) {
        const { subject, html } = renderCodeEmail(data.kind, data.locale ?? 'en', data.code, data.to);
        return this.senderService.send({
            subject,
            html,
            from: { name: 'WorkZora', email: process.env.SMTP_USER ?? '' },
            to: { name: data.to, email: data.to },
        });
    }
}
