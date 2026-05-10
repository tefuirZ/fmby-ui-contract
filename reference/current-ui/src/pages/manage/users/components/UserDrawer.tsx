import type {
  ManageMountRecord,
  ManageUserDetailRecord,
  ManageUserRole,
  UserStatus,
} from '@/domains/manage';
import type React from 'react';
import { FeedbackState } from '@/shared/ui/common/FeedbackState';
import { InlineBanner } from '@/shared/ui/common/InlineBanner';
import { SideDrawer } from '@/shared/ui/common/SideDrawer';
import { StatusBadge } from '@/shared/ui/common/StatusBadge';
import { formatDateTime } from '@/shared/utils/date';
import { getErrorMessage } from '@/shared/utils/error';
import styles from '../../ManagePages.module.css';
import { getManageStatusVariant } from '../../components';
import { ROLE_OPTIONS, type UserDrawerState, type UserFormState } from '../types';
import { SourceGrantEditor } from '../../source-governance-fields';
import {
  getDrawerDescription,
  getDrawerTitle,
  getUserStatusLabel,
  normalizeFormText,
} from '../formUtils';

interface MutationShape<TVars> {
  isPending: boolean;
  mutate: (vars: TVars) => void;
}

interface UserDetailQueryShape {
  data: ManageUserDetailRecord | undefined;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
}

interface UserDrawerProps {
  drawerState: UserDrawerState | null;
  userDetailQuery: UserDetailQueryShape;
  formState: UserFormState;
  setFormState: React.Dispatch<React.SetStateAction<UserFormState>>;
  mounts: ManageMountRecord[];
  mountsLoading: boolean;
  mountsError?: string;
  createUserMutation: MutationShape<import('@/domains/manage').CreateManageUserRequest>;
  updateUserMutation: MutationShape<{ userId: string; payload: import('@/domains/manage').UpdateManageUserRequest }>;
  setDrawerState: (state: UserDrawerState | null) => void;
  onClose: () => void;
}

export function UserDrawer({
  drawerState,
  userDetailQuery,
  formState,
  setFormState,
  mounts,
  mountsLoading,
  mountsError,
  createUserMutation,
  updateUserMutation,
  setDrawerState,
  onClose,
}: UserDrawerProps) {
  const currentDetail = userDetailQuery.data;
  const mountOptions = mounts.map((mount) => ({
    id: mount.id,
    name: mount.name,
    pathLabel: mount.pathLabel,
  }));

  return (
    <SideDrawer
      open={drawerState !== null}
      title={getDrawerTitle(drawerState, currentDetail)}
      description={getDrawerDescription(drawerState)}
      onOpenChange={(open) => { if (!open) onClose(); }}
    >
      {drawerState?.mode === 'create' ? (
        <div className={styles.fieldGroup}>
          <div className={styles.fieldRow}>
            <label className={styles.label}>
              用户名
              <input
                className={styles.input}
                value={formState.username}
                onChange={(event) => setFormState((current) => ({ ...current, username: event.target.value }))}
                placeholder="例如：operator_01"
              />
            </label>
            <label className={styles.label}>
              显示名
              <input
                className={styles.input}
                value={formState.displayName}
                onChange={(event) => setFormState((current) => ({ ...current, displayName: event.target.value }))}
                placeholder="用于管理页展示"
              />
            </label>
          </div>
          <div className={styles.fieldRow}>
            <label className={styles.label}>
              初始密码
              <input
                className={styles.input}
                type="password"
                value={formState.password}
                onChange={(event) => setFormState((current) => ({ ...current, password: event.target.value }))}
                placeholder="至少 8 位"
              />
            </label>
            <label className={styles.label}>
              初始状态
              <select
                className={styles.select}
                value={formState.status}
                onChange={(event) => setFormState((current) => ({ ...current, status: event.target.value as UserStatus }))}
              >
                <option value="active">正常</option>
                <option value="pending">待激活</option>
                <option value="locked">已锁定</option>
                <option value="disabled">已停用</option>
              </select>
            </label>
          </div>
          <label className={styles.label}>
            角色
            <select
              className={styles.select}
              value={formState.role}
              onChange={(event) => setFormState((current) => ({ ...current, role: event.target.value as ManageUserRole }))}
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          {mountsLoading ? (
            <div className={styles.emptyInlineState}>正在加载数据源列表…</div>
          ) : mountsError ? (
            <InlineBanner variant="warning" title="数据源列表加载失败" description={mountsError} />
          ) : (
            <SourceGrantEditor
              title="来源路径授权"
              description="留空表示先不指定来源路径，系统继续按旧媒体库授权兜底。要精细控制哪块目录可见，就在这里加。"
              mounts={mountOptions}
              value={formState.sourceGrants}
              onChange={(next) => setFormState((current) => ({ ...current, sourceGrants: next }))}
            />
          )}
          <div className={styles.buttonRow}>
            <button className={styles.secondaryButton} type="button" onClick={onClose} disabled={createUserMutation.isPending}>取消</button>
            <button
              className={styles.primaryButton}
              type="button"
              disabled={createUserMutation.isPending}
              onClick={() =>
                createUserMutation.mutate({
                  username: formState.username,
                  displayName: normalizeFormText(formState.displayName),
                  password: formState.password,
                  role: formState.role,
                  status: formState.status,
                  sourceGrants: formState.sourceGrants,
                })
              }
            >
              {createUserMutation.isPending ? '创建中...' : '创建用户'}
            </button>
          </div>
        </div>
      ) : userDetailQuery.isPending ? (
        <FeedbackState variant="loading" title="正在加载用户详情" description="正在同步账号状态、角色和最近登录信息。" />
      ) : userDetailQuery.isError ? (
        <InlineBanner variant="error" title="用户详情加载失败" description={getErrorMessage(userDetailQuery.error)} />
      ) : drawerState?.mode === 'edit' && currentDetail ? (
        <div className={styles.fieldGroup}>
          <div className={styles.fieldRow}>
            <label className={styles.label}>
              用户名
              <input className={styles.input} value={formState.username} disabled />
            </label>
            <label className={styles.label}>
              系统角色
              <select
                className={styles.select}
                value={formState.role}
                onChange={(event) => setFormState((current) => ({ ...current, role: event.target.value as ManageUserRole }))}
                disabled={updateUserMutation.isPending}
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <span className={styles.fieldHint}>这里只改系统角色；模板页里的“用户模板”目前还不是运行时事实权限组。</span>
            </label>
          </div>
          <div className={styles.fieldRow}>
            <label className={styles.label}>
              显示名
              <input
                className={styles.input}
                value={formState.displayName}
                onChange={(event) => setFormState((current) => ({ ...current, displayName: event.target.value }))}
                placeholder="留空将只显示用户名"
              />
            </label>
            <label className={styles.label}>
              状态
              <input className={styles.input} value={getUserStatusLabel(formState.status)} disabled />
              <span className={styles.fieldHint}>账号启停会吊销会话，继续走列表里的停用 / 恢复按钮，不在这里偷偷改。</span>
            </label>
          </div>
          {mountsLoading ? (
            <div className={styles.emptyInlineState}>正在加载数据源列表…</div>
          ) : mountsError ? (
            <InlineBanner variant="warning" title="数据源列表加载失败" description={mountsError} />
          ) : (
            <SourceGrantEditor
              title="来源路径授权"
              description="只要给了来源路径，这个用户的实际可见/可播就会优先按这里收口。留空表示继续用旧媒体库授权兜底。"
              mounts={mountOptions}
              value={formState.sourceGrants}
              onChange={(next) => setFormState((current) => ({ ...current, sourceGrants: next }))}
              disabled={updateUserMutation.isPending}
            />
          )}
          <div className={styles.buttonRow}>
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={() => setDrawerState({ mode: 'view', userId: currentDetail.id })}
              disabled={updateUserMutation.isPending}
            >
              取消
            </button>
            <button
              className={styles.primaryButton}
              type="button"
              disabled={updateUserMutation.isPending}
              onClick={() =>
                updateUserMutation.mutate({
                  userId: currentDetail.id,
                  payload: {
                    displayName: normalizeFormText(formState.displayName),
                    role: formState.role,
                    sourceGrants: formState.sourceGrants,
                  },
                })
              }
            >
              {updateUserMutation.isPending ? '保存中...' : '保存修改'}
            </button>
          </div>
        </div>
      ) : currentDetail ? (
        <div className={styles.fieldGroup}>
          <div className={styles.entityGrid}>
            <article className={styles.entityCard}>
              <span className={styles.mutedText}>账号</span>
              <strong>{currentDetail.displayName || currentDetail.username}</strong>
              <span className={styles.mutedText}>@{currentDetail.username}</span>
            </article>
            <article className={styles.entityCard}>
              <span className={styles.mutedText}>状态</span>
              <StatusBadge label={getUserStatusLabel(currentDetail.status)} variant={getManageStatusVariant(currentDetail.status)} />
              <span className={styles.mutedText}>最近活跃：{formatDateTime(currentDetail.lastLoginAt)}</span>
            </article>
            <article className={styles.entityCard}>
              <span className={styles.mutedText}>角色</span>
              <strong>{currentDetail.roleLabel}</strong>
              <span className={styles.mutedText}>当前批次先保持单角色模型</span>
            </article>
            <article className={styles.entityCard}>
              <span className={styles.mutedText}>来源路径授权</span>
              <strong>{currentDetail.sourceGrants.length > 0 ? `${currentDetail.sourceGrants.length} 条` : '未单独指定'}</strong>
              <span className={styles.mutedText}>
                {currentDetail.sourceGrants.length > 0
                  ? '有明确来源路径规则时，系统会优先按来源路径授权判断。'
                  : '当前仍走旧媒体库授权兜底。'}
              </span>
            </article>
          </div>
          <div className={styles.fieldRow}>
            <div className={styles.entityCard}>
              <span className={styles.mutedText}>创建时间</span>
              <strong>{formatDateTime(currentDetail.createdAt)}</strong>
              <span className={styles.mutedText}>更新时间：{formatDateTime(currentDetail.updatedAt)}</span>
            </div>
            <div className={styles.entityCard}>
              <span className={styles.mutedText}>最近设备</span>
              <strong>{currentDetail.lastDevice || '暂无记录'}</strong>
              <span className={styles.mutedText}>{currentDetail.recentClientInfo || '没有客户端上报信息'}</span>
            </div>
          </div>
          <div className={styles.buttonRow}>
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={() => setDrawerState({ mode: 'edit', userId: currentDetail.id })}
            >
              编辑资料
            </button>
            <button className={styles.ghostButton} type="button" onClick={onClose}>关闭</button>
          </div>
        </div>
      ) : null}
    </SideDrawer>
  );
}
