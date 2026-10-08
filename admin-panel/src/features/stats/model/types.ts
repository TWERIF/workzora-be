export interface StatsDay {
    day: string;
    visitors: number;
    views: number;
    newUsers: number;
    newProjects: number;
    commission: number;
    volume: number;
}

export interface StatsOverview {
    range: { from: string; to: string; days: number };
    totals: {
        users: number;
        usersByRole: Record<string, number>;
        projects: number;
        projectsByStatus: Record<string, number>;
        commission: number;
        volume: number;
    };
    period: {
        visitors: number;
        views: number;
        newUsers: number;
        newProjects: number;
        commission: number;
        volume: number;
    };
    series: StatsDay[];
}
