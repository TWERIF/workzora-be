import {
    BadRequestException,
    Body,
    Controller,
    ForbiddenException,
    Get,
    Inject,
    Param,
    Post,
    Query,
    Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Public } from '../auth/public.decorator';
import { sendRpc } from '../common/rpc';

interface CreateReviewBody {
    projectId: string;
    quality: number;
    professionalism: number;
    communication: number;
    price: number;
    deadlines: number;
    text: string;
    privateFeedback?: string;
}

// statuses after the client confirmed the work
const REVIEWABLE_STATUSES = ['completed', 'closed'];

@Controller('reviews')
export class ReviewsController {
    constructor(
        @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
        @Inject('PROJECT_SERVICE') private readonly projectClient: ClientProxy,
    ) { }

    // The author and the reviewed user are derived from the project: the client reviews
    // the chosen freelancer and the freelancer reviews the client.
    @Post()
    async create(@Req() req, @Body() body: CreateReviewBody) {
        const project = await this.getProject(body?.projectId);
        const userId: string = req.user.id;

        const isClient = project.clientId === userId;
        const isFreelancer = !!project.freelancerId && project.freelancerId === userId;
        if (!isClient && !isFreelancer) {
            throw new ForbiddenException('Only participants of the project can leave a review');
        }
        if (!REVIEWABLE_STATUSES.includes(project.status)) {
            throw new BadRequestException('A review can be left only after the project is completed');
        }

        return sendRpc(this.userClient, 'reviews.create', {
            projectId: project.id,
            projectTitle: project.title,
            authorId: userId,
            authorRole: isClient ? 'client' : 'freelancer',
            targetId: isClient ? project.freelancerId : project.clientId,
            quality: body.quality,
            professionalism: body.professionalism,
            communication: body.communication,
            price: body.price,
            deadlines: body.deadlines,
            text: body.text,
            privateFeedback: body.privateFeedback,
        });
    }

    @Public()
    @Get('user/:userId')
    findByUser(
        @Param('userId') userId: string,
        @Query('page') page = 1,
        @Query('limit') limit = 5,
    ) {
        return sendRpc(this.userClient, 'reviews.findByTarget', {
            targetId: userId,
            page: Number(page),
            limit: Number(limit),
        });
    }

    // The current user's review for the project, or null if not written yet.
    @Get('project/:projectId/mine')
    async findMine(@Param('projectId') projectId: string, @Req() req) {
        const review = await sendRpc(this.userClient, 'reviews.findMine', { projectId, authorId: req.user.id });
        // Nest serializes null as an empty body; keep the JSON shape explicit
        return { review: review ?? null };
    }

    private async getProject(projectId?: string) {
        if (!projectId) throw new BadRequestException('projectId is required');
        const project = await sendRpc(this.projectClient, 'projects.findOneProject', { id: projectId });
        if (!project) throw new BadRequestException('Project not found');
        return project;
    }
}
