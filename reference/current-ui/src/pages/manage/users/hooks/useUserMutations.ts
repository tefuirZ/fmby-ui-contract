import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  type BatchUpdateManageUsersRequest,
  manageApi,
  type CreateManageUserRequest,
  type DangerousActionRequest,
  type UpdateManageUserRequest,
  type UserStatus,
} from '@/domains/manage';
import { queryKeys } from '@/shared/query-keys';
import type { BannerState } from '@/shared/types/ui';
import { getErrorMessage } from '@/shared/utils/error';
import type { UserDrawerState } from '../types';

export interface UseUserMutationsCallbacks {
  setBanner: (state: BannerState | null) => void;
  setDrawerState: (state: UserDrawerState | null) => void;
  setPendingUser: (user: import('@/domains/manage').ManageUserRecord | null) => void;
  setBatchEditDrawerOpen: (open: boolean) => void;
  setBatchDeleteConfirmOpen: (open: boolean) => void;
  setBatchEditConfirmOpen: (open: boolean) => void;
  resetBatchEditForm: () => void;
  setSelectedUserIds: (ids: string[]) => void;
}

export function useUserMutations({
  setBanner,
  setDrawerState,
  setPendingUser,
  setBatchEditDrawerOpen,
  setBatchDeleteConfirmOpen,
  setBatchEditConfirmOpen,
  resetBatchEditForm,
  setSelectedUserIds,
}: UseUserMutationsCallbacks) {
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: ({
      userId,
      status,
      confirmation,
    }: {
      userId: string;
      status: UserStatus;
      confirmation: DangerousActionRequest;
    }) =>
      manageApi.updateUserStatus(userId, {
        status,
        confirmAction: confirmation.confirmAction,
        sessionConfirmation: confirmation.sessionConfirmation,
        currentPassword: confirmation.currentPassword,
      }),
    onSuccess: async (_, variables) => {
      setBanner({
        variant: 'success',
        title: variables.status === 'disabled' ? '用户已停用' : '用户已恢复',
        description: '列表数据已重新同步。',
      });
      setPendingUser(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.manage.users.list() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.manage.users.detail() }),
      ]);
    },
    onError: (error) => {
      setBanner({ variant: 'error', title: '用户状态更新失败', description: getErrorMessage(error) });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: (payload: CreateManageUserRequest) => manageApi.createUser(payload),
    onSuccess: async (detail) => {
      queryClient.setQueryData(queryKeys.manage.users.detail(detail.id), detail);
      setDrawerState({ mode: 'view', userId: detail.id });
      setBanner({ variant: 'success', title: '用户已创建', description: '账号、角色和初始状态已经落库。' });
      await queryClient.invalidateQueries({ queryKey: queryKeys.manage.users.list() });
    },
    onError: (error) => {
      setBanner({ variant: 'error', title: '用户创建失败', description: getErrorMessage(error) });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UpdateManageUserRequest }) =>
      manageApi.updateUser(userId, payload),
    onSuccess: async (detail) => {
      queryClient.setQueryData(queryKeys.manage.users.detail(detail.id), detail);
      setDrawerState({ mode: 'view', userId: detail.id });
      setBanner({ variant: 'success', title: '用户资料已更新', description: '系统角色、显示名和来源路径授权已经同步刷新。' });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.manage.users.list() }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.manage.users.detail(detail.id),
        }),
      ]);
    },
    onError: (error) => {
      setBanner({ variant: 'error', title: '用户资料更新失败', description: getErrorMessage(error) });
    },
  });

  const batchDeleteMutation = useMutation({
    mutationFn: ({
      userIds,
      confirmation,
    }: {
      userIds: string[];
      confirmation: DangerousActionRequest;
    }) =>
      manageApi.batchDeleteUsers({
        userIds,
        confirmAction: confirmation.confirmAction,
        sessionConfirmation: confirmation.sessionConfirmation,
        currentPassword: confirmation.currentPassword,
      }),
    onSuccess: async (result) => {
      const skippedCount = result.results.filter((item) => item.result !== 'success').length;
      setBanner({
        variant:
          result.updatedCount > 0 && skippedCount === 0 ? 'success' : 'warning',
        title:
          result.updatedCount > 0
            ? `已软删除 ${result.updatedCount} 个账号`
            : '批量删除未产生变更',
        description:
          skippedCount > 0
            ? `另有 ${skippedCount} 个账号被跳过，请检查是否已停用、权限不足或包含当前登录账号。`
            : '所选账号已停用，活跃会话也一并吊销。',
      });
      setBatchDeleteConfirmOpen(false);
      setSelectedUserIds([]);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.manage.users.list() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.manage.users.detail() }),
      ]);
    },
    onError: (error) => {
      setBanner({
        variant: 'error',
        title: '批量删除失败',
        description: getErrorMessage(error),
      });
    },
  });

  const batchUpdateUsersMutation = useMutation({
    mutationFn: (payload: BatchUpdateManageUsersRequest) =>
      manageApi.batchUpdateUsers(payload),
    onSuccess: async (result, variables) => {
      const skippedCount = result.results.filter((item) => item.result !== 'success').length;
      const updatedAreas = [
        variables.role ? '系统角色' : null,
        variables.status ? '账号状态' : null,
        variables.sourceGrants ? '来源路径授权' : null,
      ].filter(Boolean).join('、');
      setBanner({
        variant:
          result.updatedCount > 0 && skippedCount === 0 ? 'success' : 'warning',
        title:
          result.updatedCount > 0
            ? `已批量更新 ${result.updatedCount} 个账号`
            : '批量编辑未产生变更',
        description:
          skippedCount > 0
            ? `已更新 ${updatedAreas || '所选项'}，另有 ${skippedCount} 个账号被跳过，请检查是否包含当前登录账号或管理员账号。`
            : `${updatedAreas || '所选项'}已经同步刷新。`,
      });
      setBatchEditDrawerOpen(false);
      setBatchEditConfirmOpen(false);
      resetBatchEditForm();
      setSelectedUserIds([]);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.manage.users.list() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.manage.users.detail() }),
      ]);
    },
    onError: (error) => {
      setBanner({
        variant: 'error',
        title: '批量编辑失败',
        description: getErrorMessage(error),
      });
    },
  });

  return {
    updateStatusMutation,
    createUserMutation,
    updateUserMutation,
    batchUpdateUsersMutation,
    batchDeleteMutation,
  };
}
