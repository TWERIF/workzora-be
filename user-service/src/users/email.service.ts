import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { createClient } from 'redis';
import { firstValueFrom } from 'rxjs';
import { ConfirmEmailDto, PasswordResetRequestDto } from './dto';

const CODE_TTL_SECONDS = 120;
const MAX_CODE_ATTEMPTS = 5;
const VERIFIED_TTL_SECONDS = 60 * 60;
const RESET_TTL_SECONDS = 15 * 60;

@Injectable()
export class EmailService {
    private client: ReturnType<typeof createClient>;

    constructor(
        @Inject('EMAIL_SERVICE') private readonly emailService: ClientProxy
    ) {
        this.client = createClient({
            socket: {
                host: process.env.REDIS_HOST || 'localhost',
                port: Number(process.env.REDIS_PORT) || 6379,
            },
        });

        void this.client.connect();
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
            await this.client.setEx(`email-verified:${email}`, VERIFIED_TTL_SECONDS, '1');
        } else {
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
    async confirmEmail(data: PasswordResetRequestDto) {
        const code = Math.floor(10000 + Math.random() * 90000);
        await this.saveCode(data.email, code);
        await this.sendCodeEmail('email-confirm', data.email, String(code), data.locale);
        return { success: true };
    }

    async sendPasswordResetCode(email: string, locale?: string) {
        const throttled = await this.client.set(`pwd-reset-sent:${email}`, '1', { NX: true, EX: 60 });
        if (throttled !== 'OK') return;

        const code = String(Math.floor(100000 + Math.random() * 900000));
        await this.client.setEx(`pwd-reset:${email}`, RESET_TTL_SECONDS, code);
        await this.client.del(`pwd-reset-attempts:${email}`);
        await this.sendCodeEmail('password-reset', email, code, locale);
    }

    private sendCodeEmail(kind: 'password-reset' | 'email-confirm', to: string, code: string, locale?: string) {
        return firstValueFrom(this.emailService.send('send_code_email', { kind, to, code, locale }));
    }

    async consumePasswordResetCode(email: string, code: string): Promise<boolean> {
        const valid = await this.checkPasswordResetCode(email, code);
        if (valid) await this.client.del([`pwd-reset:${email}`, `pwd-reset-attempts:${email}`]);
        return valid;
    }

    async checkPasswordResetCode(email: string, code: string): Promise<boolean> {
        const saved = await this.client.get(`pwd-reset:${email}`);
        if (!saved) return false;
        if (saved === String(code).trim()) return true;

        const attempts = await this.client.incr(`pwd-reset-attempts:${email}`);
        await this.client.expire(`pwd-reset-attempts:${email}`, RESET_TTL_SECONDS);
        if (attempts >= MAX_CODE_ATTEMPTS) {
            await this.client.del([`pwd-reset:${email}`, `pwd-reset-attempts:${email}`]);
        }
        return false;
    }
}
