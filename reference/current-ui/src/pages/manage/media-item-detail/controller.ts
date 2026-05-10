import { useEffect, useState } from 'react';

import type { DangerousActionRequest } from '@/domains/manage';
import type {
  ManageMediaItemArtworkKind,
  ManageMediaItemDetailRecord,
  ManageMediaItemSubtitleOverrideRecord,
} from '@/domains/manage/media-items';
import type { BannerState } from '@/shared/types/ui';
import { getErrorMessage } from '@/shared/utils/error';

import { useManageMediaItemMetadataMutations } from '../media-items/hooks';
import {
  buildBaselineMetadata,
  buildFormState,
  buildResourceContext,
  buildSubtitleDrafts,
  buildUpdatePayload,
  countDirtyFields,
  createEmptySubtitleUploadState,
  getArtworkKindLabel,
  parseSubtitleSortOrder,
  type ArtworkDeleteState,
  type MetadataFormErrors,
  type MetadataFormState,
  type SourceDeleteState,
  type SubtitleDeleteState,
  type SubtitleDraftState,
  type SubtitleUploadState,
  validateForm,
} from './helpers';

type MediaItemMetadataMutations = ReturnType<typeof useManageMediaItemMetadataMutations>;

export function useManageMediaItemDetailController({
  detail,
  mutations,
}: {
  detail: ManageMediaItemDetailRecord;
  mutations: MediaItemMetadataMutations;
}) {
  const {
    updateMutation,
    resetMutation,
    uploadArtworkMutation,
    deleteArtworkMutation,
    uploadSubtitleMutation,
    updateSubtitleMutation,
    deleteSubtitleMutation,
    deleteSourceMutation,
    refreshMetadataMutation,
    scanMutation,
  } = mutations;

  const [banner, setBanner] = useState<BannerState | null>(null);
  const [form, setForm] = useState<MetadataFormState | null>(null);
  const [errors, setErrors] = useState<MetadataFormErrors>({});
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [pendingArtworkDelete, setPendingArtworkDelete] = useState<ArtworkDeleteState | null>(null);
  const [pendingSourceDelete, setPendingSourceDelete] = useState<SourceDeleteState | null>(null);
  const [pendingSubtitleDelete, setPendingSubtitleDelete] = useState<SubtitleDeleteState | null>(null);
  const [subtitleUpload, setSubtitleUpload] = useState<SubtitleUploadState>(() =>
    createEmptySubtitleUploadState(),
  );
  const [subtitleDrafts, setSubtitleDrafts] = useState<Record<string, SubtitleDraftState>>({});

  useEffect(() => {
    setForm(buildFormState(detail));
    setErrors({});
    setSubtitleDrafts(buildSubtitleDrafts(detail));
  }, [detail]);

  const currentForm = form ?? buildFormState(detail);
  const dirtyCount = countDirtyFields(detail, currentForm);

  const setField = (key: keyof MetadataFormState, value: string) => {
    setForm((current) => ({
      ...(current ?? buildFormState(detail)),
      [key]: value,
    }));
  };

  const handleDiscard = () => {
    setForm(buildFormState(detail));
    setErrors({});
    setBanner(null);
  };

  const handleSave = async () => {
    const nextErrors = validateForm(currentForm);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setBanner({
        variant: 'error',
        title: '表单校验没过',
        description: '先把日期、评分或演员格式这些基础错误修干净。',
      });
      return;
    }

    try {
      await updateMutation.mutateAsync(buildUpdatePayload(detail, currentForm));
      setBanner({
        variant: 'success',
        title: '元数据已保存',
        description: '当前资源的本地元数据覆盖已经和详情页同步。',
      });
    } catch (error) {
      setBanner({
        variant: 'error',
        title: '元数据保存失败',
        description: getErrorMessage(error),
      });
    }
  };

  const handleReset = async (confirmation: DangerousActionRequest) => {
    try {
      const result = await resetMutation.mutateAsync(confirmation);
      setConfirmResetOpen(false);
      setBanner({
        variant: result.result === 'noop' ? 'info' : 'success',
        title: result.result === 'noop' ? '没有可重置的本地覆盖' : '已恢复远端默认值',
        description: result.message,
      });
    } catch (error) {
      setBanner({
        variant: 'error',
        title: '恢复默认失败',
        description: getErrorMessage(error),
      });
    }
  };

  const handleRefreshMetadata = async () => {
    try {
      await refreshMetadataMutation.mutateAsync();
      setBanner({
        variant: 'success',
        title: '已刷新元数据',
        description: '最新 NFO 与本地探测结果已经重新灌回详情页。',
      });
    } catch (error) {
      setBanner({
        variant: 'error',
        title: '刷新元数据失败',
        description: getErrorMessage(error),
      });
    }
  };

  const handleScan = async () => {
    try {
      const result = await scanMutation.mutateAsync();
      setBanner({
        variant: result.result === 'noop' ? 'info' : 'success',
        title: result.result === 'noop' ? '重扫未重复排队' : '已加入 scoped scan 队列',
        description: result.message,
      });
    } catch (error) {
      setBanner({
        variant: 'error',
        title: '发起重扫失败',
        description: getErrorMessage(error),
      });
    }
  };

  const handleArtworkUpload = async (kind: ManageMediaItemArtworkKind, file: File | null) => {
    if (!file) {
      return;
    }
    try {
      await uploadArtworkMutation.mutateAsync({
        artworkKind: kind,
        file,
      });
      setBanner({
        variant: 'success',
        title: `${getArtworkKindLabel(kind)} 已更新`,
        description: '新图片已经落到本地覆盖态，详情页预览同步切换。',
      });
    } catch (error) {
      setBanner({
        variant: 'error',
        title: `${getArtworkKindLabel(kind)} 上传失败`,
        description: getErrorMessage(error),
      });
    }
  };

  const handleDeleteArtwork = async (confirmation: DangerousActionRequest) => {
    if (!pendingArtworkDelete) {
      return;
    }
    try {
      const result = await deleteArtworkMutation.mutateAsync({
        overrideId: pendingArtworkDelete.id,
        confirmation,
      });
      setPendingArtworkDelete(null);
      setBanner({
        variant: 'success',
        title: `${getArtworkKindLabel(pendingArtworkDelete.artworkKind)} 已恢复默认`,
        description: result.message,
      });
    } catch (error) {
      setBanner({
        variant: 'error',
        title: '删除本地图像失败',
        description: getErrorMessage(error),
      });
    }
  };

  const handleRequestDeleteSource = (next: SourceDeleteState) => {
    deleteSourceMutation.reset();
    setPendingSourceDelete(next);
  };

  const handleDeleteSource = async (confirmation: DangerousActionRequest) => {
    if (!pendingSourceDelete) {
      return;
    }
    try {
      const result = await deleteSourceMutation.mutateAsync({
        sourceId: pendingSourceDelete.id,
        confirmation,
      });
      setPendingSourceDelete(null);
      setBanner({
        variant: 'success',
        title: '媒体源已删除',
        description: result.message,
      });
    } catch (error) {
      setBanner({
        variant: 'error',
        title: '删除媒体源失败',
        description: getErrorMessage(error),
      });
    }
  };

  const setSubtitleUploadField = (key: 'language' | 'sortOrder', value: string) => {
    setSubtitleUpload((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubtitleUploadActiveChange = (checked: boolean) => {
    setSubtitleUpload((current) => ({
      ...current,
      isActive: checked,
      isDefault: checked ? current.isDefault : false,
    }));
  };

  const handleSubtitleUploadDefaultChange = (checked: boolean) => {
    setSubtitleUpload((current) => ({
      ...current,
      isDefault: checked,
      isActive: checked ? true : current.isActive,
    }));
  };

  const setSubtitleDraftField = (
    overrideId: string,
    key: keyof SubtitleDraftState,
    value: string | boolean,
  ) => {
    setSubtitleDrafts((current) => ({
      ...current,
      [overrideId]: {
        ...(current[overrideId] ?? {
          language: '',
          isActive: true,
          isDefault: false,
          sortOrder: '0',
        }),
        [key]: value,
      },
    }));
  };

  const handleSubtitleDraftDefaultChange = (
    overrideId: string,
    checked: boolean,
    draft: SubtitleDraftState,
  ) => {
    setSubtitleDrafts((current) => ({
      ...current,
      [overrideId]: {
        ...draft,
        isDefault: checked,
        isActive: checked ? true : draft.isActive,
      },
    }));
  };

  const handleSubtitleUpload = async () => {
    if (!subtitleUpload.file) {
      setBanner({
        variant: 'error',
        title: '字幕文件还没选',
        description: '先选一个 srt、ass、ssa 或 vtt 文件再上传。',
      });
      return;
    }

    const sortOrder = parseSubtitleSortOrder(subtitleUpload.sortOrder);
    if (!Number.isFinite(sortOrder)) {
      setBanner({
        variant: 'error',
        title: '字幕顺序无效',
        description: 'sortOrder 必须是整数。',
      });
      return;
    }

    try {
      await uploadSubtitleMutation.mutateAsync({
        file: subtitleUpload.file,
        language: subtitleUpload.language.trim() || undefined,
        isActive: subtitleUpload.isActive,
        isDefault: subtitleUpload.isDefault,
        sortOrder,
      });
      setSubtitleUpload(createEmptySubtitleUploadState());
      setBanner({
        variant: 'success',
        title: '字幕已上传',
        description: '本地字幕覆盖已经写入，下面的列表会立即刷新。',
      });
    } catch (error) {
      setBanner({
        variant: 'error',
        title: '字幕上传失败',
        description: getErrorMessage(error),
      });
    }
  };

  const handleSubtitleSave = async (overrideId: string) => {
    const draft = subtitleDrafts[overrideId];
    if (!draft) {
      return;
    }
    const sortOrder = parseSubtitleSortOrder(draft.sortOrder);
    if (!Number.isFinite(sortOrder)) {
      setBanner({
        variant: 'error',
        title: '字幕顺序无效',
        description: 'sortOrder 必须是整数。',
      });
      return;
    }

    try {
      await updateSubtitleMutation.mutateAsync({
        overrideId,
        payload: {
          language: draft.language.trim() || undefined,
          isActive: draft.isActive,
          isDefault: draft.isDefault,
          sortOrder,
        },
      });
      setBanner({
        variant: 'success',
        title: '字幕设置已保存',
        description: '当前这条字幕的语言、启停与优先级已经更新。',
      });
    } catch (error) {
      setBanner({
        variant: 'error',
        title: '字幕设置保存失败',
        description: getErrorMessage(error),
      });
    }
  };

  const handleRequestDeleteSubtitle = (item: ManageMediaItemSubtitleOverrideRecord) => {
    setPendingSubtitleDelete(item);
  };

  const handleDeleteSubtitle = async (confirmation: DangerousActionRequest) => {
    if (!pendingSubtitleDelete) {
      return;
    }
    try {
      const result = await deleteSubtitleMutation.mutateAsync({
        overrideId: pendingSubtitleDelete.id,
        confirmation,
      });
      setPendingSubtitleDelete(null);
      setBanner({
        variant: 'success',
        title: '字幕已删除',
        description: result.message,
      });
    } catch (error) {
      setBanner({
        variant: 'error',
        title: '删除字幕失败',
        description: getErrorMessage(error),
      });
    }
  };

  const handleEnqueueScrape = async (force: boolean) => {
    try {
      const result = await mutations.enqueueScrapeMutation.mutateAsync({ force });
      const outcomeLabel = (() => {
        switch (result.outcome) {
          case 'queued':
            return '已入队';
          case 'updated':
            return '已重置入队';
          case 'skipped_fresh':
            return '指纹未变，跳过重复入队';
          default:
            return '已处理';
        }
      })();
      setBanner({
        variant: result.outcome === 'skipped_fresh' ? 'info' : 'success',
        title: force ? '强制刷新刮削' : '触发刮削',
        description: `${outcomeLabel}（task ${result.taskId.slice(0, 8)}…，状态 ${result.status}）。`,
      });
    } catch (error) {
      setBanner({
        variant: 'error',
        title: force ? '强制刮削失败' : '触发刮削失败',
        description: getErrorMessage(error),
      });
    }
  };

  return {
    banner,
    errors,
    resourceContext: buildResourceContext(detail),
    baselineMetadata: buildBaselineMetadata(detail),
    currentForm,
    dirtyCount,
    isDirty: dirtyCount > 0,
    isMetadataWriting: updateMutation.isPending || resetMutation.isPending,
    confirmResetOpen,
    pendingArtworkDelete,
    pendingSourceDelete,
    pendingSubtitleDelete,
    subtitleUpload,
    subtitleDrafts,
    setField,
    handleDiscard,
    handleSave,
    setConfirmResetOpen,
    handleReset,
    handleRefreshMetadata,
    handleScan,
    handleArtworkUpload,
    setPendingArtworkDelete,
    handleDeleteArtwork,
    handleRequestDeleteSource,
    setPendingSourceDelete,
    handleDeleteSource,
    setSubtitleUpload,
    setSubtitleUploadField,
    handleSubtitleUploadActiveChange,
    handleSubtitleUploadDefaultChange,
    setSubtitleDraftField,
    handleSubtitleDraftDefaultChange,
    handleSubtitleUpload,
    handleSubtitleSave,
    handleRequestDeleteSubtitle,
    setPendingSubtitleDelete,
    handleDeleteSubtitle,
    handleEnqueueScrape,
    deleteSourceMutation,
  };
}
