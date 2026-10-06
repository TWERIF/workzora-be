import { BadRequestException, Body, Controller, Get, HttpCode, Inject, Post, Query, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Roles, RolesGuard } from '../auth/guards/role-guard';
import { Public } from '../auth/public.decorator';
import { sendRpc } from '../common/rpc';

const MAX_DAYS = 366;
const VISITOR_ID_RE = /^[A-Za-z0-9-]{8,64}$/;

// YYYY-MM-DD of a date in the Kyiv timezone, which all stats are grouped by
const kyivDay = (date: Date) => date.toLocaleDateString('sv-SE', { timeZone: 'Europe/Kyiv' });

// Every day of the range, so charts get zeros instead of gaps
function daysBetween(from: string, to: string): string[] {
  const days: string[] = [];
  const cursor = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  while (cursor <= end) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

@Controller('stats')
@UseGuards(RolesGuard)
export class StatsController {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('PROJECT_SERVICE') private readonly projectClient: ClientProxy,
    @Inject('INVOICES_SERVICE') private readonly invoicesClient: ClientProxy,
  ) {}

  // Called by the website on every page view; one visitor id is kept per browser.
  @Public()
  @Post('visit')
  @HttpCode(204)
  visit(@Body() body: { visitorId?: string }) {
    if (!body?.visitorId || !VISITOR_ID_RE.test(body.visitorId)) {
      throw new BadRequestException('Invalid visitor id');
    }
    this.userClient.emit('stats.visit', { visitorId: body.visitorId });
  }

  @Roles('admin')
  @Get('overview')
  async overview(@Query('days') daysParam?: string) {
    const days = Math.min(Math.max(Number(daysParam) || 30, 1), MAX_DAYS);
    const to = kyivDay(new Date());
    const from = kyivDay(new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000));
    const range = { from, to };

    const [visits, users, projects, earnings] = await Promise.all([
      sendRpc<{ day: string; visitors: number; views: number }[]>(this.userClient, 'stats.visits', range),
      sendRpc<{ total: number; byRole: Record<string, number>; byDay: { day: string; count: number }[] }>(this.userClient, 'stats.users', range),
      sendRpc<{ total: number; byStatus: Record<string, number>; byDay: { day: string; count: number }[] }>(this.projectClient, 'stats.projects', range),
      sendRpc<{ totalCommission: number; totalVolume: number; byDay: { day: string; commission: number; volume: number }[] }>(this.invoicesClient, 'stats.earnings', range),
    ]);

    const visitsByDay = new Map(visits.map((v) => [v.day, v]));
    const usersByDay = new Map(users.byDay.map((u) => [u.day, u.count]));
    const projectsByDay = new Map(projects.byDay.map((p) => [p.day, p.count]));
    const earningsByDay = new Map(earnings.byDay.map((e) => [e.day, e]));

    const series = daysBetween(from, to).map((day) => ({
      day,
      visitors: visitsByDay.get(day)?.visitors ?? 0,
      views: visitsByDay.get(day)?.views ?? 0,
      newUsers: usersByDay.get(day) ?? 0,
      newProjects: projectsByDay.get(day) ?? 0,
      // kopecks
      commission: earningsByDay.get(day)?.commission ?? 0,
      volume: earningsByDay.get(day)?.volume ?? 0,
    }));

    const sum = (key: keyof (typeof series)[number]) =>
      series.reduce((total, row) => total + (row[key] as number), 0);

    return {
      range: { from, to, days },
      totals: {
        users: users.total,
        usersByRole: users.byRole,
        projects: projects.total,
        projectsByStatus: projects.byStatus,
        commission: earnings.totalCommission,
        volume: earnings.totalVolume,
      },
      period: {
        visitors: sum('visitors'),
        views: sum('views'),
        newUsers: sum('newUsers'),
        newProjects: sum('newProjects'),
        commission: sum('commission'),
        volume: sum('volume'),
      },
      series,
    };
  }
}
