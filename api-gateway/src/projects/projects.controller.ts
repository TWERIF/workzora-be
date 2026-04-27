import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Public } from '../auth/public.decorator';
import { Roles, RolesGuard } from '../auth/guards/role-guard';
import { AuthGuard } from '../auth/guards/auth-guard';

@Controller('projects')
@UseGuards(AuthGuard, RolesGuard)
export class ProjectsController {
  constructor(
    @Inject('PROJECT_SERVICE') private readonly projectClient: ClientProxy,
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
  ) {}

  @Roles('client')
  @Post()
  async createPtoject(@Req() req, @Body() body) {
    const user = req.user;
    const payload = { ...body, clientId: user.id };
    try {
      return await firstValueFrom(
        this.projectClient.send('projects.createProject', payload),
      );
    } catch (e) {
      throw new Error('Error occured while creating project');
    }
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
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return await firstValueFrom(
      this.projectClient.send('projects.findOneProject', { id }),
    );
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
}
