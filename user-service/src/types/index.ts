export enum UserRole {
  FREELANCER = 'freelancer',
  CLIENT = 'client',
  ADMIN = 'admin',
}
export enum WorkType {
  FULLTIME = 'FULLTIME',
  PARTTIME = 'PARTTIME',
  FLEXIBLE = 'FLEXIBLE',
}

export enum PreferredBudgetType {
  HOURLY = 'HOURLY',
  FIXED = 'FIXED',
}

export enum PreferredProjectSize {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
}

export enum Availability {
  AVAILABLE = 'AVAILABLE',
  OPENTOOFFERS = 'OPENTOOFFERS',
  BUSY = 'BUSY',
  NOTAVAILABLE = 'NOTAVAILABLE',
}
export const RATE_TYPES = ['STANDARD', 'FROM'] as const;
export const PROJECT_TYPES = ['ONE_TIME', 'ONGOING', 'LONG_TERM', 'CONSULTATIONS'] as const;
export const BUDGET_RANGES = ['UNDER_500', 'FROM_500_TO_1000', 'FROM_1000_TO_3000', 'OVER_3000'] as const;
export const WORK_FORMATS = ['REMOTE', 'PARTTIME', 'FULLTIME', 'FLEXIBLE'] as const;
export const RATE_NOTE_MAX = 200;
