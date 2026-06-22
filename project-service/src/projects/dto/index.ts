import { Id } from "../../categories/dto";
import { ProjectStatus } from "../entities/project.entity";

export interface CreateProjectDto {
  title: string;
  description: string;
  categories: string[];
  clientId: string;
  price: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  categories: any[];
  price: number;
  clientId: string;
  client: any;
  freelancerId: string;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  status: ProjectStatus;
  clientName: string;
}

export interface UpdateProjectDto extends Partial<Project> { }

export interface Pagination {
  page: number;
  limit: number
}

export interface MyProjectsDto extends Pagination {
  userId: string;
  status: string;
}

export interface AwaitingPaymentDto extends Id {
  freelancerId: string;
}