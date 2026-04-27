export class CreateProjectDto {
  title!: string;
  description!: string;
  skills!: string[];
  clientId!: string;
  createdAt!: Date;
  views!: number;
  price!: number;
}
