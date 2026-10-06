import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { createClient } from 'redis';
import { firstValueFrom } from 'rxjs';
import { ConfirmEmailDto, FindByEmailDto } from './dto';

const CODE_TTL_SECONDS = 120;
const MAX_CODE_ATTEMPTS = 5;
const VERIFIED_TTL_SECONDS = 60 * 60;
const RESET_TTL_SECONDS = 15 * 60;

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

    // Password recovery: a 6-digit code mailed to the user, valid for 15 minutes, 5 attempts.
    async sendPasswordResetCode(email: string, locale?: string) {
        // at most one email per minute per address, so the form can't be used to spam someone
        const throttled = await this.client.set(`pwd-reset-sent:${email}`, '1', { NX: true, EX: 60 });
        if (throttled !== 'OK') return;

        const code = String(Math.floor(100000 + Math.random() * 900000));
        await this.client.setEx(`pwd-reset:${email}`, RESET_TTL_SECONDS, code);
        await this.client.del(`pwd-reset-attempts:${email}`);

        const uk = locale === 'uk';
        const subject = uk ? 'Відновлення пароля Workzora' : 'Workzora password reset';
        const html = uk
            ? `<p>Ваш код для відновлення пароля:</p><h2>${code}</h2><p>Код дійсний 15 хвилин. Якщо ви не запитували відновлення, просто проігноруйте цей лист.</p>`
            : `<p>Your password reset code:</p><h2>${code}</h2><p>The code is valid for 15 minutes. If you didn't request a reset, just ignore this email.</p>`;

        await firstValueFrom(
            this.emailService.send('send_email', {
                to: { name: email, email },
                from: { name: 'Workzora', email: process.env.SMTP_USER },
                subject,
                html,
            }),
        );
    }

    async consumePasswordResetCode(email: string, code: string): Promise<boolean> {
        const saved = await this.client.get(`pwd-reset:${email}`);
        if (!saved) return false;

        if (saved === String(code).trim()) {
            await this.client.del([`pwd-reset:${email}`, `pwd-reset-attempts:${email}`]);
            return true;
        }

        const attempts = await this.client.incr(`pwd-reset-attempts:${email}`);
        await this.client.expire(`pwd-reset-attempts:${email}`, RESET_TTL_SECONDS);
        if (attempts >= MAX_CODE_ATTEMPTS) {
            await this.client.del([`pwd-reset:${email}`, `pwd-reset-attempts:${email}`]);
        }
        return false;
    }
}
