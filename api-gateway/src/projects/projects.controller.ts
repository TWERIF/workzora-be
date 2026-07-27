import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AuthGuard } from '../auth/guards/auth-guard';
import { Roles, RolesGuard } from '../auth/guards/role-guard';
import { Public } from '../auth/public.decorator';
import type { AwaitingPaymentDto } from './dto';

@Controller('projects')
@UseGuards(AuthGuard, RolesGuard)
export class ProjectsController {
  constructor(
    @Inject('PROJECT_SERVICE') private readonly projectClient: ClientProxy,
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('SEARCH_SERVICE') private readonly searchClient: ClientProxy,
  ) { }

  @Get('search')
  async searchProjects(@Query('searchTerm') searchTerm: string) {
    if (!searchTerm || searchTerm.trim() === '') {
      return [];
    }

    try {
      return await firstValueFrom(
        this.searchClient.send('projects.search', { searchTerm }),
      );
    } catch (error) {
      console.error('Search Service Error:', error);
      throw new HttpException(
        'Search service is temporarily unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Get('my')
  async getMyProjects(
    @Req() req,
    @Query('status') status: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const user = req.user;

    try {
      const result = await firstValueFrom(
        this.projectClient.send('projects.findMyProjects', {
          userId: user.id,
          status,
          page: Number(page),
          limit: Number(limit),
        }),
      );

      if (result && result.error === 'DB_ERROR') {
        throw new HttpException(
          'Database error occurred while fetching your projects',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return result;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new HttpException(
        'Failed to fetch your projects',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  @Public()
  @Get('count')
  async count() {
    return await firstValueFrom(
      this.projectClient.send('projects.count', {}),
    );
  }
  @Public()
  @Get('topProjects')
  async getTopProjects() {
    try {
      const projects = await firstValueFrom(
        this.projectClient.send('projects.getTopProjects', {}),
      );

      const projectsWithUsers = await Promise.all(
        projects.map(async (p) => {
          try {
            const user = await firstValueFrom(
              this.userClient.send('users.get', p.clientId),
            );
            return { ...p, clientName: user.firstName };
          } catch (userError) {
            return { ...p, clientName: 'Unknown' };
          }
        }),
      );
      return projectsWithUsers;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Project service unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }


  @Roles('client')
  @Post()
  async createPtoject(@Req() req, @Body() body) {
    const user = req.user;
    const payload = { ...body, clientId: user.id };
    try {
      return await firstValueFrom(
        this.projectClient.send('projects.create', payload),
      );
    } catch (e) {
      throw new Error('Error occured while creating project');
    }
  }

  @Roles('client')
  @Patch(':id')
  async updateProject(
    @Param('id') id: string,
    @Body() body,
    @Req() req,
  ) {
    try {
      return await firstValueFrom(
        this.projectClient.send('projects.update', {
          id,
          ...body,
        }),
      );
    } catch (e) {
      throw new HttpException(
        'Failed to update project',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Roles('client')
  @Delete(':id')
  async deleteProject(@Param('id') id: string) {
    try {
      return await firstValueFrom(
        this.projectClient.send('projects.delete', {
          id,
        }),
      );
    } catch (e) {
      throw new HttpException(
        'Failed to delete project',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const project = await firstValueFrom(
      this.projectClient.send('projects.findOneProject', { id }),
    );

    const client = await firstValueFrom(
      this.userClient.send('users.get', { id: project.clientId })
    )
    delete project.clientId;
    delete client.password;
    delete client.reserveEmail;
    return {
      ...project,
      client
    }
  }

  @Get()
  async get(@Req() req, @Query('page') page = 1, @Query('limit') limit = 10) {
    const user = req.user;
    if (!user) return;

    return await firstValueFrom(
      this.projectClient.send('projects.findProjects', {
        id: user.id,
        role: user.role,
        page,
        limit,
      }),
    );
  }

  @Roles('client')
  @Patch(':id/awaiting-payment')
  async toAwaitingPayment(
    @Param('id') id: string,
    @Body() body: AwaitingPaymentDto,
    @Req() req,
  ) {

    return await firstValueFrom(
      this.projectClient.send('projects.toAwaitingPayment', {
        id,
        freelancerId: body.freelancerId,
      }),
    );

  }

  @Roles('client')
  @Patch(':id/completed')
  async toInCompleted(
    @Param('id') id: string,
  ) {
    try {
      return await firstValueFrom(
        this.projectClient.send('projects.toInCompleted', {
          id
        }),
      );
    } catch (e) {
      throw new HttpException(
        'Failed to process awaiting payment status',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Roles('admin')
  @Patch(':id/closed')
  async toClosed(
    @Param('id') id: string,
  ) {
    try {
      return await firstValueFrom(
        this.projectClient.send('projects.toClosed', {
          id
        }),
      );
    } catch (e) {
      throw new HttpException(
        'Failed to process awaiting payment status',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}