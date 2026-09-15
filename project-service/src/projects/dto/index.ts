import { Id } from "../../categories/dto";
import { ProjectStatus } from "../entities/project.entity";

export interface CreateProjectDto {
  title: string;
  description: string;
  categories: string[];
  tags?: string[];
  clientId: string;
  price: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  categories: any[];
  tags: string[];
  price: number;
  clientId: string;
  client: any;
  freelancerId: string;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  status: ProjectStatus;
  clientName: string;
  proposalsCount?: number;
}

export interface UpdateProjectDto extends Partial<Project> { }

export interface FindProjectsDto extends Pagination {
  search?: string;
  categories?: string[];
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
}

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