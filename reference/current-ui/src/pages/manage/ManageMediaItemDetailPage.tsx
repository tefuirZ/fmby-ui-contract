import { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, RefreshCw } from 'lucide-react';

import type { ManageMediaItemDetailRecord } from '@/domains/manage/media-items';
import { FeedbackState } from '@/shared/ui/common/FeedbackState';
import { InlineBanner } from '@/shared/ui/common/InlineBanner';
import { SensitiveActionDialog } from '@/shared/ui/common/SensitiveActionDialog';
import { getErrorMessage } from '@/shared/utils/error';

import { useManageMediaItemDetailController } from './media-item-detail/controller';
import { getArtworkKindLabel, getSourceStatusLabel } from './media-item-detail/helpers';
import {
  ArtworkSection,
  MediaItemHeroSection,
  MetadataComparisonSection,
  MetadataEditorSection,
  MetadataStickyBar,
  PipelineSection,
  RawMetadataSection,
  SourcesSection,
  StatusRailSection,
  SubtitleSection,
} from './media-item-detail/sections';
import sharedStyles from './ManagePages.module.css';
import styles from './ManageMediaItemDetailPage.module.css';
import { ManagePageHeader } from './components';
import {
  isManageMediaItemPipelineActive,
  useManageMediaItemDetailQuery,
  useManageMediaItemMetadataMutations,
  useManageMediaItemPipelineQuery,
} from './media-items/hooks';

export function ManageMediaItemDetailPage() {
  const { itemId } = useParams();
  const pipelineQuery = useManageMediaItemPipelineQuery(itemId);
  const pipelineActive = isManageMediaItemPipelineActive(pipelineQuery.data);
  const detailQuery = useManageMediaItemDetailQuery(itemId, {
    refetchIntervalMs: pipelineActive ? 3_000 : false,
  });
  const mutations = useManageMediaItemMetadataMutations(itemId);
  const lastPipelineActiveRef = useRef(false);

  useEffect(() => {
    if (lastPipelineActiveRef.current && !pipelineActive) {
      void detailQuery.refetch();
    }
    lastPipelineActiveRef.current = pipelineActive;
  }, [detailQuery, pipelineActive]);

  if (!itemId) {
    return (
      <FeedbackState
        variant="error"
        title="资源 ID 缺失"
        description="当前路由没有拿到 itemId，没法继续查详情。"
        action={
          <Link className={sharedStyles.primaryButton} to="/manage/media/items">
            返回列表
          </Link>
        }
      />
    );
  }

  if (detailQuery.isPending && !detailQuery.data) {
    return (
      <FeedbackState
        variant="loading"
        title="正在加载资源详情"
        description="正在聚合元数据、来源、图片和字幕覆盖状态。"
      />
    );
  }

  if (detailQuery.isError && !detailQuery.data) {
    return (
      <FeedbackState
        variant="error"
        title="资源详情加载失败"
        description={getErrorMessage(detailQuery.error)}
        action={
          <div className={styles.errorActions}>
            <button
              className={sharedStyles.primaryButton}
              type="button"
              onClick={() => detailQuery.refetch()}
            >
              重试
            </button>
            <Link className={sharedStyles.ghostButton} to="/manage/media/items">
              返回列表
            </Link>
          </div>
        }
      />
    );
  }

  return (
    <ManageMediaItemDetailWorkspace
      detail={detailQuery.data!}
      refetchDetail={() => detailQuery.refetch()}
      mutations={mutations}
      pipeline={pipelineQuery.data}
      pipelineLoading={pipelineQuery.isPending}
      pipelineError={pipelineQuery.isError ? pipelineQuery.error : undefined}
    />
  );
}

function ManageMediaItemDetailWorkspace({
  detail,
  refetchDetail,
  mutations,
  pipeline,
  pipelineLoading,
  pipelineError,
}: {
  detail: ManageMediaItemDetailRecord;
  refetchDetail: () => void;
  mutations: ReturnType<typeof useManageMediaItemMetadataMutations>;
  pipeline?: import('@/domains/manage/media-items').ManageMediaItemPipelineRecord;
  pipelineLoading: boolean;
  pipelineError?: unknown;
}) {
  const {
    banner,
    errors,
    resourceContext,
    baselineMetadata,
    currentForm,
    dirtyCount,
    isDirty,
    isMetadataWriting,
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
  } = useManageMediaItemDetailController({
    detail,
    mutations,
  });

  const {
    updateMutation,
    resetMutation,
    deleteArtworkMutation,
    uploadSubtitleMutation,
    updateSubtitleMutation,
    deleteSubtitleMutation,
    refreshMetadataMutation,
    scanMutation,
  } = mutations;

  return (
    <div className={sharedStyles.page}>
      <ManagePageHeader
        title={detail.item.title}
        description="资源详情页现在直接接真实接口：元数据本地覆盖、图片上传替换、字幕上传与状态调整、资源级 refresh 和 scoped scan 都在这页收口。"
        meta={
          <div className={sharedStyles.chipRow}>
            <span className={sharedStyles.chip}>{detail.item.typeLabel}</span>
            <span className={sharedStyles.chip}>媒体库 {detail.item.libraryName}</span>
            {resourceContext.ancestorChipLabels.map((label) => (
              <span key={label} className={sharedStyles.chip}>
                {label}
              </span>
            ))}
            <span className={sharedStyles.chip}>ID {detail.item.id}</span>
          </div>
        }
        actions={
          <>
            <Link className={sharedStyles.ghostButton} to="/manage/media/items">
              <ArrowLeft size={16} />
              返回列表
            </Link>
            <button
              className={sharedStyles.secondaryButton}
              type="button"
              onClick={refetchDetail}
            >
              <RefreshCw size={16} />
              刷新详情
            </button>
          </>
        }
      />

      {banner ? (
        <InlineBanner
          variant={banner.variant}
          title={banner.title}
          description={banner.description}
        />
      ) : null}

      <MediaItemHeroSection
        detail={detail}
        resourceContext={resourceContext}
        onRefreshMetadata={handleRefreshMetadata}
        refreshPending={refreshMetadataMutation.isPending}
        onScan={handleScan}
        scanPending={scanMutation.isPending}
      />

      <div className={styles.layout}>
        <div className={styles.mainColumn}>
          <MetadataComparisonSection detail={detail} baselineMetadata={baselineMetadata} />
          <PipelineSection
            pipeline={pipeline}
            pipelineLoading={pipelineLoading}
            pipelineError={pipelineError}
            enqueuePending={mutations.enqueueScrapeMutation.isPending}
            onEnqueueScrape={(force) => void handleEnqueueScrape(force)}
          />
          <MetadataEditorSection form={currentForm} errors={errors} onFieldChange={setField} />
          <ArtworkSection
            detail={detail}
            onUploadArtwork={handleArtworkUpload}
            onRequestDeleteArtwork={setPendingArtworkDelete}
          />
          <SubtitleSection
            detail={detail}
            subtitleUpload={subtitleUpload}
            onSubtitleFileSelect={(file) =>
              setSubtitleUpload((current) => ({
                ...current,
                file,
              }))
            }
            onSubtitleUploadFieldChange={setSubtitleUploadField}
            onSubtitleUploadActiveChange={handleSubtitleUploadActiveChange}
            onSubtitleUploadDefaultChange={handleSubtitleUploadDefaultChange}
            onSubtitleUpload={handleSubtitleUpload}
            uploadPending={uploadSubtitleMutation.isPending}
            subtitleDrafts={subtitleDrafts}
            onSubtitleDraftFieldChange={setSubtitleDraftField}
            onSubtitleDraftDefaultChange={handleSubtitleDraftDefaultChange}
            onSubtitleSave={handleSubtitleSave}
            updatePending={updateSubtitleMutation.isPending}
            onRequestDeleteSubtitle={handleRequestDeleteSubtitle}
          />
          <SourcesSection
            detail={detail}
            deletingSourceId={
              deleteSourceMutation.isPending ? pendingSourceDelete?.id : undefined
            }
            onRequestDeleteSource={handleRequestDeleteSource}
          />
          <RawMetadataSection detail={detail} />
        </div>

        <aside className={styles.sideColumn}>
          <StatusRailSection detail={detail} />
        </aside>
      </div>

      {isDirty ? (
        <MetadataStickyBar
          dirtyCount={dirtyCount}
          isMetadataWriting={isMetadataWriting}
          updatePending={updateMutation.isPending}
          onDiscard={handleDiscard}
          onReset={() => setConfirmResetOpen(true)}
          onSave={() => void handleSave()}
        />
      ) : null}

      <SensitiveActionDialog
        open={confirmResetOpen}
        actionKey="reset-media-item-metadata"
        title="恢复元数据默认值"
        description="这会删除当前资源的本地元数据覆盖，页面会回退到远端/NFO 解析结果。"
        impact={[
          '只影响当前资源的本地态，不会回写 AList / OpenList / 网盘原文件。',
          '如果远端元数据本身不完整，恢复后页面显示也会一起回退。',
        ]}
        confirmLabel="确认恢复默认"
        pending={resetMutation.isPending}
        onOpenChange={setConfirmResetOpen}
        onConfirm={(confirmation) => void handleReset(confirmation)}
      />

      <SensitiveActionDialog
        open={pendingArtworkDelete !== null}
        actionKey="delete-media-item-artwork"
        title={
          pendingArtworkDelete
            ? `删除 ${getArtworkKindLabel(pendingArtworkDelete.artworkKind)} 本地覆盖`
            : ''
        }
        description="删除后会回退到远端图片或无图占位，不会触碰远端 sidecar 文件。"
        impact={
          pendingArtworkDelete
            ? [
                `将删除本地覆盖文件：${pendingArtworkDelete.originalFilename}`,
                '详情页当前图片会立即回退到远端资源或空状态。',
              ]
            : undefined
        }
        confirmLabel="删除本地覆盖"
        pending={deleteArtworkMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setPendingArtworkDelete(null);
          }
        }}
        onConfirm={(confirmation) => void handleDeleteArtwork(confirmation)}
      />

      <SensitiveActionDialog
        open={pendingSubtitleDelete !== null}
        actionKey="delete-media-item-subtitle"
        title={pendingSubtitleDelete ? '删除本地字幕覆盖' : ''}
        description="删除后这条字幕会从本地态移除，播放器侧如果使用它将回退到其它可用字幕。"
        impact={
          pendingSubtitleDelete
            ? [`将删除本地字幕文件：${pendingSubtitleDelete.originalFilename}`]
            : undefined
        }
        confirmLabel="删除本地字幕"
        pending={deleteSubtitleMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setPendingSubtitleDelete(null);
          }
        }}
        onConfirm={(confirmation) => void handleDeleteSubtitle(confirmation)}
      />

      <SensitiveActionDialog
        open={pendingSourceDelete !== null}
        actionKey="delete-media-item-source"
        title={pendingSourceDelete ? `删除媒体源：${pendingSourceDelete.mountName}` : ''}
        description="删除后当前资源会失去这条来源记录；如果它是最后一个来源，这条资源将暂时没有可播源。"
        impact={
          pendingSourceDelete
            ? [
                `源文件：${pendingSourceDelete.filePath}`,
                `当前来源状态：${getSourceStatusLabel(pendingSourceDelete.sourceStatus)}`,
                '探测任务和探测快照会一并清掉；如果仍被播放会话引用，后端会拒绝删除。',
              ]
            : undefined
        }
        errorMessage={
          pendingSourceDelete && deleteSourceMutation.isError
            ? getErrorMessage(deleteSourceMutation.error)
            : undefined
        }
        confirmLabel="删除媒体源"
        pending={deleteSourceMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            deleteSourceMutation.reset();
            setPendingSourceDelete(null);
          }
        }}
        onConfirm={(confirmation) => void handleDeleteSource(confirmation)}
      />
    </div>
  );
}
