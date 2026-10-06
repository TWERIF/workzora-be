export type ProjectStatus = 'open' | 'awaiting_payment' | 'in_progress' | 'completed' | 'closed';

export interface ProjectRecord {
  id: string;
  title: string;
  description: string;
  price: string | number;
  clientId: string;
  freelancerId: string | null;
  status: ProjectStatus;
}
