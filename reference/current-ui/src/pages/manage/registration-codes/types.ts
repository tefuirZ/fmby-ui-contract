import type {
  ManageUserRole,
  RegistrationCodeBatchMode,
  RegistrationCodeBatchRecord,
  RegistrationCodeRecord,
  RegistrationCodeStatus,
} from '@/domains/manage';

export interface RegistrationCodeFormState {
  mode: RegistrationCodeBatchMode;
  batchName: string;
  generateCount: string;
  code: string;
  roleTemplate: ManageUserRole;
  usageLimit: string;
  maxSessions: string;
  validDays: string;
  expiresAt: string;
  defaultLibraries: string[];
  allowReactivation: boolean;
  requireApproval: boolean;
}

export interface CopyToastState {
  title: string;
  description: string;
}

export type PendingCodeAction =
  | {
      kind: 'status';
      record: RegistrationCodeRecord;
    }
  | {
      kind: 'delete';
      record: RegistrationCodeRecord;
    };

export interface RegistrationCodeMetrics {
  totalBatches: number;
  totalCodes: number;
  totalAvailableCodes: number;
  totalUsedCodes: number;
  totalRestrictedCodes: number;
}

export interface RegistrationCodeFilters {
  statusFilter: 'all' | RegistrationCodeStatus;
  searchKeyword: string;
}

export interface RegistrationCodeBatchSummary {
  batch: RegistrationCodeBatchRecord;
  roleLabels: string[];
  libraryLabels: string[];
}
