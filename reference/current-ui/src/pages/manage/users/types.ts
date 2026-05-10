import type {
  ManageSourcePathGrantInput,
  ManageUserRole,
  UserStatus,
} from '@/domains/manage';

export type UserDrawerMode = 'create' | 'view' | 'edit';

export interface UserDrawerState {
  mode: UserDrawerMode;
  userId?: string;
}

export interface UserFormState {
  username: string;
  displayName: string;
  password: string;
  role: ManageUserRole;
  status: UserStatus;
  sourceGrants: ManageSourcePathGrantInput[];
}

export interface UserBatchEditFormState {
  applyRole: boolean;
  role: ManageUserRole;
  applyStatus: boolean;
  status: UserStatus;
  applySourceGrants: boolean;
  sourceGrants: ManageSourcePathGrantInput[];
}

export const ROLE_OPTIONS: Array<{ value: ManageUserRole; label: string }> = [
  { value: 'user', label: '普通用户' },
  { value: 'restricted_user', label: '受限用户' },
  { value: 'admin', label: '管理员' },
  { value: 'super_admin', label: '超级管理员' },
];

export const DEFAULT_FORM_STATE: UserFormState = {
  username: '',
  displayName: '',
  password: '',
  role: 'user',
  status: 'active',
  sourceGrants: [],
};

export const DEFAULT_BATCH_EDIT_FORM_STATE: UserBatchEditFormState = {
  applyRole: false,
  role: 'user',
  applyStatus: false,
  status: 'active',
  applySourceGrants: false,
  sourceGrants: [],
};
