import { Id } from "../../categories/dto";

export interface CreateProjectDto {
  title: string;
  description: string;
  categories: string[];
  tags?: string[];
  clientId: string;
  price: number;
}
export interface UpdateProjectDto extends Partial<CreateProjectDto>, Id { }
export interface AwaitingPaymentDto { freelancerId: string; }