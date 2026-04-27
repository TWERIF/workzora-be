import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { createClient } from 'redis';
import { ConfirmEmailDto, FindByEmailDto } from './dto';

@Injectable()
export class EmailService {
    private transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'mailhog',
        port: Number(process.env.SMTP_PORT) || 1025,
        secure: false,
        // Для MailHog auth не потрібен
        // auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    });
    private client;

    constructor() {
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
        return {success:Boolean(saved === code.toString())};
    }
    async confirmEmail(data: FindByEmailDto) {
        const { email } = data;

        const code = Math.floor(10000 + Math.random() * 90000);

        await this.transporter.sendMail({
            from: `"Workzora" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Confirm your email',
            html: `
        <p>Your confirmation code is:</p>
        <h2>${code}</h2>
        <p>Enter this code in the app to confirm your email.</p>
      `,
        });
        console.log(code)
        await this.saveCode(email, code);

        return { success: true };
    }
}
