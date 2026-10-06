import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Availability, PreferredBudgetType, PreferredProjectSize, UserRole, WorkType } from '../../types';

export class IdDto {
  @IsUUID()
  id!: string;
}

export class IdsDto {
  @IsArray()
  @IsUUID('all', { each: true })
  ids!: string[];
}

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsString()
  @MaxLength(100)
  firstName!: string;

  @IsString()
  @MaxLength(100)
  lastName!: string;

  @IsString()
  @MaxLength(100)
  username!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

export class RegisterUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsString()
  @MaxLength(100)
  firstName!: string;

  @IsString()
  @MaxLength(100)
  lastName!: string;

  @IsString()
  @MaxLength(100)
  username!: string;

  @IsOptional()
  @IsIn([UserRole.CLIENT, UserRole.FREELANCER])
  role?: UserRole;

  @IsOptional()
  @IsIn(['en', 'uk'])
  locale?: string;
}

export class GoogleProfileDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  avatar?: string;

  @IsOptional()
  @IsString()
  provider?: string;
}

export class UpdateUserDto {
  @IsUUID()
  id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEmail()
  reserveEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  position?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  rate?: number;

  @IsOptional()
  @IsEnum(WorkType)
  workType?: WorkType;

  @IsOptional()
  @IsEnum(Availability)
  availability?: Availability;

  @IsOptional()
  @IsEnum(PreferredBudgetType)
  preferredBudgetType?: PreferredBudgetType;

  @IsOptional()
  @IsEnum(PreferredProjectSize)
  preferredProjectSize?: PreferredProjectSize;

  @IsOptional()
  @IsIn([UserRole.CLIENT, UserRole.FREELANCER])
  role?: UserRole;
}

export class FindByEmailDto {
  @IsEmail()
  email!: string;
}

export class ConfirmEmailDto extends FindByEmailDto {
  @Type(() => Number)
  @IsInt()
  code!: number;
}

export class CredentialsDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

export class PasswordResetRequestDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsIn(['en', 'uk'])
  locale?: string;
}

export class PasswordResetDto {
  @IsEmail()
  email!: string;

  @IsString()
  code!: string;

  @IsString()
  password!: string;
}

export class SwitchRoleDto {
  @IsUUID()
  id!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  activeDeals!: number;
}

export class TopClientsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  ratings?: number[];
}

export class UploadAvatarDto {
  @IsUUID()
  userId!: string;

  @IsUrl({ protocols: ['https'], require_protocol: true })
  avatarUrl!: string;
}

export class ProfilesPreviewDto {
  @IsOptional()
  @IsIn([UserRole.CLIENT, UserRole.FREELANCER])
  role?: UserRole;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  amount?: number;
}
