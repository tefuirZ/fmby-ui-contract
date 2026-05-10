import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { type ManageUserRecord, type UserStatus } from '@/domains/manage';
import { manageApi } from '@/domains/manage';
import { useSession } from '@/shared/hooks';
import { FeedbackState } from '@/shared/ui/common/FeedbackState';
import { InlineBanner } from '@/shared/ui/common/InlineBanner';
import { SensitiveActionDialog } from '@/shared/ui/common/SensitiveActionDialog';
import { queryKeys } from '@/shared/query-keys';
import styles from './ManagePages.module.css';
import { ManagePageHeader } from './components';
import { getErrorMessage } from '@/shared/utils/error';
import type { BannerState } from '@/shared/types/ui';
import { matchKeyword } from '@/shared/search/matchKeyword';
import {
  type UserDrawerState,
  type UserFormState,
  DEFAULT_BATCH_EDIT_FORM_STATE,
  DEFAULT_FORM_STATE,
} from './users/types';
import { buildUserFormState, getNextUserAction } from './users/formUtils';
import { useUsersQuery, useUserDetailQuery, useUserMutations } from './users/hooks';
import { BatchUserEditDrawer, UserTable, UserDrawer } from './users/components';

export function ManageUsersPage() {
  const { user: currentUser } = useSession();
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');
  const [banner, setBanner] = useState<BannerState | null>(null);
  const [pendingUser, setPendingUser] = useState<ManageUserRecord | null>(null);
  const [drawerState, setDrawerState] = useState<UserDrawerState | null>(null);
  const [formState, setFormState] = useState<UserFormState>(DEFAULT_FORM_STATE);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [batchEditDrawerOpen, setBatchEditDrawerOpen] = useState(false);
  const [batchEditConfirmOpen, setBatchEditConfirmOpen] = useState(false);
  const [batchEditFormState, setBatchEditFormState] = useState(DEFAULT_BATCH_EDIT_FORM_STATE);
  const [batchDeleteConfirmOpen, setBatchDeleteConfirmOpen] = useState(false);
  const deferredKeyword = useDeferredValue(keyword.trim());

  const usersQuery = useUsersQuery();
  const userDetailQuery = useUserDetailQuery(drawerState);
  const mountsQuery = useQuery({
    queryKey: queryKeys.manage.mounts.list(),
    queryFn: () => manageApi.getMounts(),
    staleTime: 60_000,
  });
  const {
    updateStatusMutation,
    createUserMutation,
    updateUserMutation,
    batchUpdateUsersMutation,
    batchDeleteMutation,
  } = useUserMutations({
    setBanner,
    setDrawerState,
    setPendingUser,
    setBatchEditDrawerOpen,
    setBatchEditConfirmOpen,
    setBatchDeleteConfirmOpen,
    resetBatchEditForm: () => setBatchEditFormState(DEFAULT_BATCH_EDIT_FORM_STATE),
    setSelectedUserIds,
  });

  useEffect(() => {
    if (drawerState?.mode === 'create') { setFormState(DEFAULT_FORM_STATE); return; }
    if (drawerState?.mode === 'edit' && userDetailQuery.data) {
      setFormState(buildUserFormState(userDetailQuery.data));
    }
  }, [drawerState?.mode, userDetailQuery.data]);

  const users = usersQuery.data?.items ?? [];
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesKeyword = matchKeyword(
        deferredKeyword,
        user.username,
        user.displayName,
        user.roleLabel,
        ...user.sourceGrants.map((grant) => `${grant.mountId} ${grant.pathPrefix}`),
      );
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      return matchesKeyword && matchesStatus;
    });
  }, [deferredKeyword, statusFilter, users]);

  const selectedUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          selectedUserIds.includes(user.id) && user.id !== currentUser?.id,
      ),
    [currentUser?.id, selectedUserIds, users],
  );
  const selectableUsers = useMemo(
    () =>
      filteredUsers.filter(
        (user) => user.status !== 'disabled' && user.id !== currentUser?.id,
      ),
    [currentUser?.id, filteredUsers],
  );

  if (usersQuery.isPending) {
    return <FeedbackState variant="loading" title="正在加载用户列表" description="正在同步用户角色、状态和最近登录设备。" />;
  }
  if (usersQuery.isError) {
    return (
      <FeedbackState
        variant="error"
        title="用户列表加载失败"
        description={getErrorMessage(usersQuery.error)}
        action={<button className={styles.primaryButton} onClick={() => usersQuery.refetch()}>重试</button>}
      />
    );
  }

  return (
    <div className={styles.page}>
      <ManagePageHeader
        title="用户管理"
        description="补齐账号详情、创建、编辑和批量软删除闭环，删除语义先明确收口为停用账号并吊销活跃会话。"
        meta={<span className={styles.metaText}>共 {users.length} 个账号</span>}
        actions={
          <>
            <button className={styles.primaryButton} type="button" onClick={() => { setBanner(null); setDrawerState({ mode: 'create' }); }}>新建用户</button>
            <button className={styles.secondaryButton} type="button" onClick={() => usersQuery.refetch()}>刷新</button>
          </>
        }
      />

      {banner ? <InlineBanner variant={banner.variant} title={banner.title} description={banner.description} /> : null}

      <UserTable
        users={users}
        filteredUsers={filteredUsers}
        currentUserId={currentUser?.id}
        keyword={keyword}
        statusFilter={statusFilter}
        selectedUserIds={selectedUserIds}
        onKeywordChange={setKeyword}
        onStatusFilterChange={setStatusFilter}
        onSelectUser={(userId, checked) =>
          setSelectedUserIds((current) =>
            checked ? Array.from(new Set([...current, userId])) : current.filter((item) => item !== userId),
          )
        }
        onSelectAll={(checked) =>
          setSelectedUserIds((current) => {
            if (checked) {
              const merged = new Set(current);
              selectableUsers.forEach((user) => merged.add(user.id));
              return Array.from(merged);
            }
            return current.filter((id) => !selectableUsers.some((user) => user.id === id));
          })
        }
        onOpenView={(id) => { setBanner(null); setDrawerState({ mode: 'view', userId: id }); }}
        onOpenEdit={(id) => { setBanner(null); setDrawerState({ mode: 'edit', userId: id }); }}
        onToggleUserStatus={(user) => {
          if (user.id === currentUser?.id) {
            setBanner({
              variant: 'warning',
              title: '当前登录账号不能在这里停用',
              description: '为了避免把管理端自己锁死，当前账号状态只能保持启用。',
            });
            return;
          }
          setBanner(null);
          setPendingUser(user);
        }}
      />

      {selectedUsers.length > 0 ? (
        <div className={styles.stickyBar}>
          <div className={styles.stackText}>
            <strong>已选择 {selectedUsers.length} 个账号</strong>
            <span className={styles.mutedText}>
              当前删除语义为软删除：账号会停用并吊销活跃会话，已停用账号会自动跳过。
            </span>
          </div>
          <div className={styles.rowActions}>
            <button className={styles.secondaryButton} type="button" onClick={() => setSelectedUserIds([])}>清空选择</button>
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={() => {
                setBatchEditFormState(DEFAULT_BATCH_EDIT_FORM_STATE);
                setBatchEditDrawerOpen(true);
              }}
            >
              批量编辑
            </button>
            <button className={styles.dangerButton} type="button" onClick={() => setBatchDeleteConfirmOpen(true)}>批量删除</button>
          </div>
        </div>
      ) : null}

      <UserDrawer
        drawerState={drawerState}
        userDetailQuery={userDetailQuery}
        formState={formState}
        setFormState={setFormState}
        mounts={mountsQuery.data?.items ?? []}
        mountsLoading={mountsQuery.isPending}
        mountsError={mountsQuery.isError ? getErrorMessage(mountsQuery.error) : undefined}
        createUserMutation={createUserMutation}
        updateUserMutation={updateUserMutation}
        setDrawerState={setDrawerState}
        onClose={() => setDrawerState(null)}
      />

      <BatchUserEditDrawer
        open={batchEditDrawerOpen}
        selectedUsers={selectedUsers}
        formState={batchEditFormState}
        setFormState={setBatchEditFormState}
        mounts={mountsQuery.data?.items ?? []}
        mountsLoading={mountsQuery.isPending}
        mountsError={mountsQuery.isError ? getErrorMessage(mountsQuery.error) : undefined}
        pending={batchUpdateUsersMutation.isPending}
        onClose={() => setBatchEditDrawerOpen(false)}
        onSubmit={() => setBatchEditConfirmOpen(true)}
      />

      <SensitiveActionDialog
        open={batchEditConfirmOpen}
        actionKey="batch-update-users"
        title={`批量编辑 ${selectedUsers.length} 个账号`}
        description="系统会只改你在上一层勾选的字段，未勾选的内容保持不动。"
        impact={[
          batchEditFormState.applyRole ? '会统一覆盖所选账号的系统角色。' : '不会动系统角色。',
          batchEditFormState.applyStatus ? '会统一调整账号状态；停用会直接吊销活跃会话。' : '不会动账号状态。',
          batchEditFormState.applySourceGrants ? '会整体替换来源路径授权；留空保存等于清空来源路径规则。' : '不会动来源路径授权。',
        ]}
        confirmLabel="确认批量编辑"
        onOpenChange={setBatchEditConfirmOpen}
        onConfirm={(confirmation) => {
          batchUpdateUsersMutation.mutate({
            userIds: selectedUsers.map((user) => user.id),
            role: batchEditFormState.applyRole ? batchEditFormState.role : undefined,
            status: batchEditFormState.applyStatus ? batchEditFormState.status : undefined,
            sourceGrants: batchEditFormState.applySourceGrants
              ? batchEditFormState.sourceGrants
              : undefined,
            confirmAction: confirmation.confirmAction,
            sessionConfirmation: confirmation.sessionConfirmation,
            currentPassword: confirmation.currentPassword,
          });
        }}
        pending={batchUpdateUsersMutation.isPending}
      />

      <SensitiveActionDialog
        open={pendingUser !== null}
        actionKey="update-user-status"
        title={pendingUser ? `${getNextUserAction(pendingUser).label}：${pendingUser.displayName || pendingUser.username}` : ''}
        description="关键账号状态调整需要二次确认，避免误操作。"
        impact={pendingUser ? getNextUserAction(pendingUser).impact : undefined}
        confirmLabel={pendingUser ? getNextUserAction(pendingUser).label : '确认'}
        onOpenChange={(open) => { if (!open) setPendingUser(null); }}
        onConfirm={(confirmation) => {
          if (!pendingUser) return;
          const nextAction = getNextUserAction(pendingUser);
          updateStatusMutation.mutate({
            userId: pendingUser.id,
            status: nextAction.status,
            confirmation,
          });
        }}
        pending={updateStatusMutation.isPending}
      />

      <SensitiveActionDialog
        open={batchDeleteConfirmOpen}
        actionKey="delete-users"
        title={`批量删除 ${selectedUsers.length} 个账号`}
        description="当前删除语义为软删除：系统会停用所选账号，并同时吊销其活跃会话。"
        impact="当前登录账号会被自动跳过，已停用账号不会重复执行，也不会做物理删库。"
        confirmLabel="确认批量删除"
        onOpenChange={setBatchDeleteConfirmOpen}
        onConfirm={(confirmation) => {
          batchDeleteMutation.mutate({
            userIds: selectedUsers.map((user) => user.id),
            confirmation,
          });
        }}
        pending={batchDeleteMutation.isPending}
      />
    </div>
  );
}
