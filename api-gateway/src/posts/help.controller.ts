import { Body, Controller, Delete, Get, HttpCode, Inject, Param, ParseUUIDPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Roles, RolesGuard } from '../auth/guards/role-guard';
import { Public } from '../auth/public.decorator';
import { sendRpc } from '../common/rpc';
import { HelpAdminQueryDto, HelpArticleDto, HelpFeedbackDto, HelpListQueryDto, HelpLocaleQueryDto } from './help.dto';

@ApiTags('Help')
@Controller('help')
@UseGuards(RolesGuard)
export class HelpController {
  constructor(@Inject('POSTS_SERVICE') private readonly postsClient: ClientProxy) {}

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'Help categories with article counts' })
  categories(@Query() { locale }: HelpLocaleQueryDto) {
    return sendRpc(this.postsClient, 'help.categories', { locale });
  }

  @Public()
  @Get('articles')
  @ApiOperation({ summary: 'Help articles of a category or found by a search' })
  list(@Query() query: HelpListQueryDto) {
    return sendRpc(this.postsClient, 'help.list', query);
  }

  @Public()
  @Get('categories/:category/:slug')
  @ApiOperation({ summary: 'Help article' })
  get(@Param('category') category: string, @Param('slug') slug: string, @Query() { locale }: HelpLocaleQueryDto) {
    return sendRpc(this.postsClient, 'help.get', { category, slug, locale });
  }

  @Public()
  @Post('articles/:id/feedback')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Did this answer your question' })
  feedback(@Param('id', ParseUUIDPipe) id: string, @Body() body: HelpFeedbackDto) {
    return sendRpc(this.postsClient, 'help.feedback', { id, reaction: body.reaction });
  }

  @Roles('admin')
  @Get('admin/articles')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'All help articles (admin)' })
  adminList(@Query() query: HelpAdminQueryDto) {
    return sendRpc(this.postsClient, 'help.adminList', query);
  }

  @Roles('admin')
  @Get('admin/articles/:id')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Help article by id (admin)' })
  adminGet(@Param('id', ParseUUIDPipe) id: string) {
    return sendRpc(this.postsClient, 'help.adminGet', { id });
  }

  @Roles('admin')
  @Post('admin/articles')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Create a help article (admin)' })
  create(@Body() body: HelpArticleDto) {
    return sendRpc(this.postsClient, 'help.create', body);
  }

  @Roles('admin')
  @Put('admin/articles/:id')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Edit a help article (admin)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() body: HelpArticleDto) {
    return sendRpc(this.postsClient, 'help.update', { ...body, id });
  }

  @Roles('admin')
  @Delete('admin/articles/:id')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Delete a help article (admin)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return sendRpc(this.postsClient, 'help.delete', { id });
  }
}
