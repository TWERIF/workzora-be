import {
    Body,
    Controller,
    Delete,
    Get,
    Inject,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { AuthGuard } from '../auth/guards/auth-guard';
import { Roles, RolesGuard } from '../auth/guards/role-guard';
import type {
    CreateCategoriesDto,
    UpdateCategoriesDto,
} from './dto';

@Controller('categories')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
export class CategoriesController {
    constructor(
        @Inject('PROJECT_SERVICE')
        private readonly projectClient: ClientProxy,
    ) { }

    @Get()
    async findAll(
        @Query('page') page = 1,
        @Query('limit') limit = 10,
    ) {
        return await firstValueFrom(
            this.projectClient.send('categories.findAll', {
                page: Number(page),
                limit: Number(limit),
            }),
        );
    }
    @Get('search')
    async search(
        @Query('search') search: string,
        @Query('page') page = 1,
        @Query('limit') limit = 10,
    ) {
        return await firstValueFrom(
            this.projectClient.send('categories.search', {
                search,
                page: Number(page),
                limit: Number(limit),
            }),
        );
    }
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return await firstValueFrom(
            this.projectClient.send('categories.findOne', { id }),
        );
    }

    @Post()
    async create(@Body() dto: CreateCategoriesDto) {
        return await firstValueFrom(
            this.projectClient.send('categories.create', dto),
        );
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateCategoriesDto,
    ) {
        return await firstValueFrom(
            this.projectClient.send('categories.update', {
                id,
                ...dto,
            }),
        );
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return await firstValueFrom(
            this.projectClient.send('categories.delete', { id }),
        );
    }
}