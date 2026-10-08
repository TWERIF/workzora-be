import { Body, Controller, HttpCode, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../auth/public.decorator';
import { sendRpc } from '../common/rpc';
import { SubscribeDto, UnsubscribeDto } from './dto';

@ApiTags('Newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(@Inject('EMAIL_SERVICE') private readonly emailClient: ClientProxy) {}

  @Public()
  @Post('subscribe')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Subscribe an email to new blog articles' })
  subscribe(@Body() body: SubscribeDto) {
    return sendRpc(this.emailClient, 'newsletter.subscribe', body);
  }

  @Public()
  @Post('unsubscribe')
  @HttpCode(200)
  @ApiOperation({ summary: 'Unsubscribe by the token from an email' })
  unsubscribe(@Body() body: UnsubscribeDto) {
    return sendRpc(this.emailClient, 'newsletter.unsubscribe', body);
  }
}
