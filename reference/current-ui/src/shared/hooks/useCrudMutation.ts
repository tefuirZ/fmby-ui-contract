import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { QueryKey, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';

/**
 * 通用 CRUD Mutation Hook
 *
 * 封装了 manage 页面中最常见的 CRUD 模式：
 * - 执行 mutationFn
 * - 成功后批量 invalidateQueries（可选 removeQueries）
 * - 透传 onSuccess / onError / onSettled 回调
 *
 * @example
 * ```ts
 * const createMount = useCrudMutation({
 *   mutationFn: (data: CreateMountRequest) => manageApi.createMount(data),
 *   invalidateKeys: [queryKeys.manage.mounts.list()],
 *   onSuccess: () => setDrawerOpen(false),
 *   onError: (err) => setBanner({ variant: 'error', message: getErrorMessage(err) }),
 * });
 * ```
 */
export interface CrudMutationOptions<TVariables, TResult, TOnMutateResult = unknown>
  extends Omit<UseMutationOptions<TResult, unknown, TVariables, TOnMutateResult>, 'mutationFn'> {
  mutationFn: (data: TVariables) => Promise<TResult>;
  /** 成功后需要 invalidate 的 QueryKey 列表 */
  invalidateKeys?: QueryKey[];
  /** 成功后需要 remove（清出缓存）的 QueryKey 列表（常用于删除操作） */
  removeKeys?: QueryKey[];
}

export function useCrudMutation<TVariables, TResult, TOnMutateResult = unknown>(
  options: CrudMutationOptions<TVariables, TResult, TOnMutateResult>,
): UseMutationResult<TResult, unknown, TVariables, TOnMutateResult> {
  const queryClient = useQueryClient();
  const { mutationFn, invalidateKeys = [], removeKeys = [], onSuccess, ...rest } = options;

  return useMutation<TResult, unknown, TVariables, TOnMutateResult>({
    mutationFn,
    onSuccess: async (result, variables, onMutateResult, context) => {
      const tasks: Promise<void>[] = [];

      for (const key of invalidateKeys) {
        tasks.push(queryClient.invalidateQueries({ queryKey: key }));
      }
      for (const key of removeKeys) {
        queryClient.removeQueries({ queryKey: key });
      }

      if (tasks.length > 0) {
        await Promise.all(tasks);
      }

      await onSuccess?.(result, variables, onMutateResult, context);
    },
    ...rest,
  });
}
