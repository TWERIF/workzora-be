import { Body, Controller, Delete, Get, Inject, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles, RolesGuard } from '../auth/guards/role-guard';
import { Public } from '../auth/public.decorator';
import { PaginationQueryDto } from '../common/pagination.dto';
import { sendRpc } from '../common/rpc';
import { CreateCategoryDto, SearchCategoriesQueryDto, UpdateCategoryDto } from './dto';

@ApiTags('categories')
@Controller('categories')
@UseGuards(RolesGuard)
@Roles('admin')
export class CategoriesController {
  constructor(@Inject('PROJECT_SERVICE') private readonly projectClient: ClientProxy) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Categories with project counts' })
  findAll(@Query() query: PaginationQueryDto) {
    return sendRpc(this.projectClient, 'categories.findAll', query);
  }

  @Public()
  @Get('search')
  @ApiOperation({ summary: 'Search categories by title' })
  search(@Query() query: SearchCategoriesQueryDto) {
    return sendRpc(this.projectClient, 'categories.search', { ...query, search: query.search ?? '' });
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Category by id' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return sendRpc(this.projectClient, 'categories.findOne', { id });
  }

  @Post()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Create a category (admin)' })
  create(@Body() dto: CreateCategoryDto) {
    return sendRpc(this.projectClient, 'categories.create', dto);
  }

  @Patch(':id')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Edit a category (admin)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCategoryDto) {
    return sendRpc(this.projectClient, 'categories.update', { ...dto, id });
  }

  @Delete(':id')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Delete a category (admin)' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return sendRpc(this.projectClient, 'categories.delete', { id });
  }
}
