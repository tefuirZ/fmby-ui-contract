import type { ManageUserDetailRecord, ManageUserRecord, UserStatus } from '@/domains/manage';
import type { UserDrawerState, UserFormState } from './types';
import { ROLE_OPTIONS } from './types';

export function buildUserFormState(user: ManageUserDetailRecord): UserFormState {
  return {
    username: user.username,
    displayName: user.displayName ?? '',
    password: '',
    role: user.roles[0] ?? 'user',
    status: user.status,
    sourceGrants: user.sourceGrants ?? [],
  };
}

export function normalizeFormText(value: string) {
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

export function getDrawerTitle(drawerState: UserDrawerState | null, detail?: ManageUserDetailRecord) {
  if (!drawerState) return '用户详情';
  if (drawerState.mode === 'create') return '新建用户';
  if (drawerState.mode === 'edit') return detail ? `编辑用户：${detail.displayName || detail.username}` : '编辑用户';
  return detail ? `用户详情：${detail.displayName || detail.username}` : '用户详情';
}

export function getDrawerDescription(drawerState: UserDrawerState | null) {
  if (!drawerState) return undefined;
  switch (drawerState.mode) {
    case 'create': return '先补齐最基础的账号创建入口，角色先维持单角色模型。';
    case 'edit': return '这里改的是系统角色、显示名和来源路径授权；账号启停继续走列表里的停用/恢复按钮。';
    default: return '查看账号状态、角色和最近登录设备。';
  }
}

export function getUserStatusLabel(status: UserStatus) {
  switch (status) {
    case 'active': return '正常';
    case 'pending': return '待激活';
    case 'locked': return '已锁定';
    default: return '已停用';
  }
}

export function getUserRoleLabel(role: string) {
  return ROLE_OPTIONS.find((item) => item.value === role)?.label ?? '普通用户';
}

export function getNextUserAction(user: ManageUserRecord) {
  if (user.status === 'disabled') {
    return { label: '恢复账号', status: 'active' as UserStatus, impact: '允许该账号重新登录并恢复既有授权。' };
  }
  return { label: '停用账号', status: 'disabled' as UserStatus, impact: '该账号将无法继续登录，现有会话会被一并吊销。' };
}

export function describeSourceGrantSummary(user: ManageUserRecord) {
  if (user.sourceGrants.length === 0) {
    return '媒体库兜底';
  }
  return `${user.sourceGrants.length} 条来源路径`;
}
