import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import axios from 'axios';
import { EmailData } from '../types';

interface SendPulseToken {
    access_token: string;
    expires_in: number;
}

const errorDetails = (error: unknown) =>
    axios.isAxiosError(error) ? { status: error.response?.status, body: error.response?.data ?? error.message } : { body: String(error) };

@Injectable()
export class SenderService {
    private readonly logger = new Logger(SenderService.name);
    private readonly baseUrl = 'https://api.sendpulse.com';

    private cachedToken: string | null = null;
    private tokenExpiryTime: number | null = null;

    private async getAccessToken(): Promise<string> {
        const currentTime = Date.now();

        if (this.cachedToken && this.tokenExpiryTime && currentTime < this.tokenExpiryTime - 60 * 1000) {
            return this.cachedToken;
        }

        try {
            const response = await axios.post<SendPulseToken>(
                `${this.baseUrl}/oauth/access_token`,
                {
                    grant_type: 'client_credentials',
                    client_id: process.env.SENDPULSE_CLIENTID,
                    client_secret: process.env.SENDPULSE_SECRET,
                },
                { headers: { 'Content-Type': 'application/json' } },
            );

            this.cachedToken = response.data.access_token;
            this.tokenExpiryTime = currentTime + response.data.expires_in * 1000;
            return this.cachedToken;
        } catch (error) {
            this.logger.error('SendPulse token request failed', errorDetails(error));
            throw new RpcException({ statusCode: HttpStatus.BAD_GATEWAY, message: 'Email provider is unavailable' });
        }
    }

    async send(data: EmailData) {
        const token = await this.getAccessToken();
        try {
            const result = await axios.post(
                `${this.baseUrl}/smtp/emails`,
                {
                    email: {
                        html: Buffer.from(data.html).toString('base64'),
                        subject: data.subject,
                        from: { name: data.from.name, email: data.from.email },
                        to: [{ name: data.to.name, email: data.to.email }],
                    },
                },
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } },
            );
            return result.data;
        } catch (error) {
            this.logger.error('SendPulse send failed', errorDetails(error));
            throw new RpcException({ statusCode: HttpStatus.BAD_GATEWAY, message: 'Email was not sent' });
        }
    }
}
