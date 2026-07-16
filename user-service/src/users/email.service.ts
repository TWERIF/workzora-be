import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { createClient } from 'redis';
import { firstValueFrom } from 'rxjs';
import { ConfirmEmailDto, FindByEmailDto } from './dto';

@Injectable()
export class EmailService {
    private client;

    constructor(
        @Inject('EMAIL_SERVICE') private readonly emailService: ClientProxy
    ) {
        this.client = createClient({
            socket: {
                host: process.env.REDIS_HOST || 'localhost',
                port: Number(process.env.REDIS_PORT) || 6379,
            },
        });

        this.client.connect().then(() => console.log('Redis connected'));
    }
    async saveCode(email: string, code: number) {
        await this.client.setEx(`email:${email}`, 120, code.toString());
    }

    async verifyCode(dto: ConfirmEmailDto) {
        const { code, email } = dto;
        const saved = await this.client.get(`email:${email}`);
        if (!saved) return false;
        return { success: Boolean(saved === code.toString()) };
    }
    async confirmEmail(data: FindByEmailDto) {
        const { email } = data;

        const code = Math.floor(10000 + Math.random() * 90000);

        await firstValueFrom(
            this.emailService.send('send_email', {
                to: { name: email, email },
                from: { name: 'Workzora', email: process.env.SMTP_USER },
                subject: 'Confirm your email',
                html: `
        <p>Your confirmation code is:</p>
        <h2>${code}</h2>
        <p>Enter this code in the app to confirm your email.</p>
      `,
            }),
        );

        await this.saveCode(email, code);

        return { success: true };
    }
}