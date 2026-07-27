export interface Id { id: string };
export interface DeleteBid extends Id { userId: string };
export interface WonBid extends Id { freelancerId: string };