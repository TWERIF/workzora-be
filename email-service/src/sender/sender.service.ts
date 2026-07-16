import { HttpException, HttpStatus, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import { EmailData } from '../types';

@Injectable()
export class SenderService {
    private readonly logger = new Logger(SenderService.name);
    private readonly baseUrl = 'https://api.sendpulse.com';

    private cachedToken: string | null = null;
    private tokenExpiryTime: number | null = null;

    private async getAccessToken(): Promise<string | null> {
        const currentTime = Date.now();

        if (this.cachedToken && this.tokenExpiryTime && currentTime < this.tokenExpiryTime - 60 * 1000) {
            return this.cachedToken;
        }

        try {
            const response = await axios.post(
                `${this.baseUrl}/oauth/access_token`,
                {
                    grant_type: "client_credentials",
                    client_id: process.env.SENDPULSE_CLIENTID,
                    client_secret: process.env.SENDPULSE_SECRET
                },
                {
                    headers: { "Content-Type": "application/json" }
                }
            );

            const { access_token, expires_in } = response.data;

            this.cachedToken = access_token;
            this.tokenExpiryTime = currentTime + (expires_in * 1000);

            return this.cachedToken;
        } catch (error: Error | any) {
            const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
            const message = error.response?.data || "Не вдалося отримати токен SendPulse";
            this.logger.error('Помилка отримання токена SendPulse', error.response?.data || error.message);
            throw new HttpException(message, status);
        }
    }

    async send(data: EmailData) {
        try {
            const token = await this.getAccessToken();
            if (!token) throw new UnauthorizedException("Email token is invalid");
            console.log(data)
            const result = await axios.post(
                `${this.baseUrl}/smtp/emails`,
                {
                    email: {
                        html: Buffer.from(data.html || '').toString('base64'),
                        subject: data.subject,
                        from: {
                            name: data.from.name,
                            email: data.from.email,
                        },
                        to: [
                            {
                                name: data.to.name,
                                email: data.to.email,
                            },
                        ],
                    },
                },
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            return result.data;
        } catch (error: Error | any) {
            const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
            const message = error.response?.data || "Помилка під час відправлення листа";
            this.logger.error('Помилка відправлення листа через SendPulse', error.response?.data || error.message);
            throw new HttpException(message, status);
        }
    }
}