export interface CreateCategoriesDto {
    title: string;
    description: string;
}

export interface Id {
    id: string;
}

export interface UpdateCategoriesDto extends Partial<CreateCategoriesDto>, Id { };