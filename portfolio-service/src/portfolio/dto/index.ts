export interface CreatePortfolio {
    userId: string;
    title: string;
    description: string;
    imageUrl: string;
}

export interface UpdatePortfolio extends CreatePortfolio {
    id: string;
}