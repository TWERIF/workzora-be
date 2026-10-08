import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { PostPublishedDto, SubscribeDto, UnsubscribeDto } from './dto';
import { NewsletterService } from './newsletter.service';

@Controller()
export class NewsletterController {
    constructor(private readonly newsletter: NewsletterService) {}

    @MessagePattern('newsletter.subscribe')
    subscribe(@Payload() dto: SubscribeDto) {
        return this.newsletter.subscribe(dto);
    }

    @MessagePattern('newsletter.unsubscribe')
    unsubscribe(@Payload() dto: UnsubscribeDto) {
        return this.newsletter.unsubscribe(dto.token);
    }

    @EventPattern('post.published')
    announce(@Payload() dto: PostPublishedDto) {
        return this.newsletter.announce(dto);
    }
}
