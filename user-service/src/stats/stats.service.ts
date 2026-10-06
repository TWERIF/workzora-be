import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { DailyVisit } from './entities/daily-visit.entity';

export interface StatsRange {
  from: string; // ISO date, inclusive
  to: string; // ISO date, inclusive
}

const TZ = 'Europe/Kyiv';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(DailyVisit) private readonly visits: Repository<DailyVisit>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async recordVisit(visitorId: string): Promise<void> {
    await this.visits.query(
      `INSERT INTO analytics.daily_visits (id, day, "visitorId", views)
       VALUES (gen_random_uuid(), (now() AT TIME ZONE '${TZ}')::date, $1, 1)
       ON CONFLICT (day, "visitorId") DO UPDATE SET views = analytics.daily_visits.views + 1`,
      [visitorId],
    );
  }

  async visitStats({ from, to }: StatsRange) {
    const rows: { day: string; visitors: string; views: string }[] = await this.visits.query(
      `SELECT to_char(day, 'YYYY-MM-DD') AS day, count(*) AS visitors, sum(views) AS views
       FROM analytics.daily_visits
       WHERE day BETWEEN $1 AND $2
       GROUP BY day ORDER BY day`,
      [from, to],
    );
    return rows.map((r) => ({ day: r.day, visitors: Number(r.visitors), views: Number(r.views) }));
  }

  async userStats({ from, to }: StatsRange) {
    const byDay: { day: string; count: string }[] = await this.users.query(
      `SELECT to_char(("createdAt" AT TIME ZONE '${TZ}')::date, 'YYYY-MM-DD') AS day, count(*) AS count
       FROM users.users
       WHERE "createdAt" IS NOT NULL AND ("createdAt" AT TIME ZONE '${TZ}')::date BETWEEN $1 AND $2
       GROUP BY 1 ORDER BY 1`,
      [from, to],
    );
    const byRole: { role: string; count: string }[] = await this.users.query(
      `SELECT role, count(*) AS count FROM users.users GROUP BY role`,
    );

    return {
      total: byRole.reduce((sum, r) => sum + Number(r.count), 0),
      byRole: Object.fromEntries(byRole.map((r) => [r.role, Number(r.count)])),
      byDay: byDay.map((r) => ({ day: r.day, count: Number(r.count) })),
    };
  }
}
