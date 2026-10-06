import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { createClient } from 'redis';
import { firstValueFrom } from 'rxjs';
import { ConfirmEmailDto, FindByEmailDto } from './dto';

const CODE_TTL_SECONDS = 120;
const MAX_CODE_ATTEMPTS = 5;
const VERIFIED_TTL_SECONDS = 60 * 60;

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
        await this.client.setEx(`email:${email}`, CODE_TTL_SECONDS, code.toString());
        await this.client.del(`email-attempts:${email}`);
    }

    async verifyCode(dto: ConfirmEmailDto) {
        const { code, email } = dto;
        const saved = await this.client.get(`email:${email}`);
        if (!saved) return false;

        const success = saved === String(code);
        if (success) {
            await this.client.del([`email:${email}`, `email-attempts:${email}`]);
            // registration reads this flag to activate the account
            await this.client.setEx(`email-verified:${email}`, VERIFIED_TTL_SECONDS, '1');
        } else {
            // a 5-digit code must not be brute-forced: drop it after a few wrong tries
            const attempts = await this.client.incr(`email-attempts:${email}`);
            await this.client.expire(`email-attempts:${email}`, CODE_TTL_SECONDS);
            if (attempts >= MAX_CODE_ATTEMPTS) {
                await this.client.del([`email:${email}`, `email-attempts:${email}`]);
            }
        }
        return { success };
    }

    async isEmailVerified(email: string): Promise<boolean> {
        return (await this.client.get(`email-verified:${email}`)) === '1';
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