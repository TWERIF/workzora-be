import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SenderService } from '../sender/sender.service';
import { renderArticleEmail } from '../templates/article-email';
import type { EmailLocale } from '../types';
import { PostPublishedDto, SubscribeDto } from './dto';
import { Subscriber } from './subscriber.entity';

const BATCH = 200;

@Injectable()
export class NewsletterService {
    private readonly logger = new Logger(NewsletterService.name);

    constructor(
        @InjectRepository(Subscriber) private readonly subscribers: Repository<Subscriber>,
        private readonly sender: SenderService,
    ) {}

    async subscribe({ email, locale = 'en' }: SubscribeDto) {
        await this.subscribers.upsert({ email: email.trim().toLowerCase(), locale }, ['email']);
        return { success: true };
    }

    async unsubscribe(token: string) {
        const result = await this.subscribers.delete({ token });
        return { success: Boolean(result.affected) };
    }

    async announce(post: PostPublishedDto) {
        let sent = 0;
        for (let skip = 0; ; skip += BATCH) {
            const batch = await this.subscribers.find({ order: { createdAt: 'ASC' }, skip, take: BATCH });
            for (const subscriber of batch) {
                const { subject, html } = renderArticleEmail(subscriber.locale as EmailLocale, post, subscriber.token);
                try {
                    await this.sender.send({
                        subject,
                        html,
                        from: { name: 'WorkZora', email: process.env.SMTP_USER ?? '' },
                        to: { name: subscriber.email, email: subscriber.email },
                    });
                    sent++;
                } catch {
                    this.logger.warn(`Article email to subscriber ${subscriber.id} failed`);
                }
            }
            if (batch.length < BATCH) break;
        }
        this.logger.log(`Article "${post.slug}" sent to ${sent} subscribers`);
    }
}
