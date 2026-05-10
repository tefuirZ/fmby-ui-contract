import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';

import type {
  ManageMediaItemMetadataRecord,
  ManageMediaItemRemoteAssetRecord,
  ManageMediaItemSourceRecord,
} from '@/domains/manage/media-items';
import { StatusBadge } from '@/shared/ui/common/StatusBadge';
import { formatDateTime } from '@/shared/utils/date';

import {
  formatActorValue,
  formatBytes,
  formatListValue,
  formatSimpleValue,
  getSourceStatusLabel,
  getSourceStatusVariant,
  type SourceDeleteState,
} from './helpers';
import sharedStyles from '../ManagePages.module.css';
import styles from '../ManageMediaItemDetailPage.module.css';

export function MetadataValueCard({
  label,
  metadata,
}: {
  label: string;
  metadata: ManageMediaItemMetadataRecord;
}) {
  return (
    <article className={styles.valueCard}>
      <div className={styles.valueCardTitle}>{label}</div>
      <dl className={styles.valueList}>
        <div className={styles.valueListRow}>
          <dt>标题</dt>
          <dd>{formatSimpleValue(metadata.title)}</dd>
        </div>
        <div className={styles.valueListRow}>
          <dt>原始标题</dt>
          <dd>{formatSimpleValue(metadata.originalTitle)}</dd>
        </div>
        <div className={styles.valueListRow}>
          <dt>排序标题</dt>
          <dd>{formatSimpleValue(metadata.sortTitle)}</dd>
        </div>
        <div className={styles.valueListRow}>
          <dt>年份</dt>
          <dd>{formatSimpleValue(metadata.year)}</dd>
        </div>
        <div className={styles.valueListRow}>
          <dt>评分</dt>
          <dd>{formatSimpleValue(metadata.communityRating)}</dd>
        </div>
        <div className={styles.valueListRow}>
          <dt>首映</dt>
          <dd>{formatSimpleValue(metadata.premiered)}</dd>
        </div>
        <div className={styles.valueListRow}>
          <dt>类型标签</dt>
          <dd>{formatListValue(metadata.genres)}</dd>
        </div>
        <div className={styles.valueListRow}>
          <dt>导演</dt>
          <dd>{formatListValue(metadata.directors)}</dd>
        </div>
        <div className={styles.valueListRow}>
          <dt>演员</dt>
          <dd>{formatActorValue(metadata.actors)}</dd>
        </div>
      </dl>
    </article>
  );
}

export function AssetPreview({
  title,
  imageUrl,
  hint,
}: {
  title: string;
  imageUrl?: string;
  hint: string;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [imageUrl]);

  return (
    <article className={styles.assetPreview}>
      <div className={styles.assetPreviewMedia}>
        {imageUrl && !failed ? (
          <img
            alt={title}
            className={styles.assetPreviewImage}
            src={imageUrl}
            onError={() => setFailed(true)}
          />
        ) : (
          <div className={styles.assetPreviewFallback}>{title}</div>
        )}
      </div>
      <div className={styles.assetPreviewTitle}>{title}</div>
      <div className={styles.assetPreviewHint}>{hint}</div>
    </article>
  );
}

export function SourceCard({
  source,
  onDelete,
  deleting,
}: {
  source: ManageMediaItemSourceRecord;
  onDelete: (source: SourceDeleteState) => void;
  deleting: boolean;
}) {
  return (
    <article className={styles.sourceCard}>
      <div className={styles.sourceCardHeader}>
        <div>
          <div className={styles.sourceCardTitle}>{source.mountName}</div>
          <div className={styles.sourceCardSubtitle}>{source.providerLabel}</div>
        </div>
        <StatusBadge
          label={getSourceStatusLabel(source.sourceStatus)}
          variant={getSourceStatusVariant(source.sourceStatus)}
        />
      </div>
      <div className={styles.sourceFacts}>
        <span className={sharedStyles.chip}>挂载 {source.mountStatus}</span>
        {source.container ? <span className={sharedStyles.chip}>容器 {source.container}</span> : null}
        {source.videoCodec ? <span className={sharedStyles.chip}>视频 {source.videoCodec}</span> : null}
        {source.audioCodec ? <span className={sharedStyles.chip}>音频 {source.audioCodec}</span> : null}
        {source.subtitleCount ? <span className={sharedStyles.chip}>字幕 {source.subtitleCount}</span> : null}
      </div>
      <div className={styles.sourcePath}>{source.filePath}</div>
      <div className={styles.sourceMeta}>
        <span>大小 {formatBytes(source.sizeBytes)}</span>
        <span>更新时间 {formatDateTime(source.updatedAt)}</span>
      </div>
      <div className={styles.cardActionRow}>
        <button
          className={sharedStyles.ghostButton}
          type="button"
          onClick={() =>
            onDelete({
              id: source.id,
              mountName: source.mountName,
              filePath: source.filePath,
              sourceStatus: source.sourceStatus,
            })
          }
          disabled={deleting}
        >
          <Trash2 size={16} />
          {deleting ? '删除中…' : '删除媒体源'}
        </button>
      </div>
    </article>
  );
}

export function RemoteAssetTable({ assets }: { assets: ManageMediaItemRemoteAssetRecord[] }) {
  if (assets.length === 0) {
    return <div className={sharedStyles.emptyInlineState}>当前没有远端 sidecar 资源记录。</div>;
  }

  return (
    <div className={sharedStyles.tableWrap}>
      <table className={sharedStyles.table}>
        <thead>
          <tr>
            <th>资源类型</th>
            <th>来源</th>
            <th>缓存</th>
            <th>文件</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr key={asset.id}>
              <td>
                <div className={sharedStyles.stackText}>
                  <span className={sharedStyles.primaryText}>{asset.assetTypeLabel}</span>
                  <span className={sharedStyles.mutedText}>{asset.language ?? '无语言标签'}</span>
                </div>
              </td>
              <td>
                <div className={sharedStyles.stackText}>
                  <span>{asset.mountName ?? '本地聚合'}</span>
                  <span className={sharedStyles.mutedText}>
                    {asset.providerType ?? '未知来源'}
                  </span>
                </div>
              </td>
              <td>
                <StatusBadge
                  label={asset.isCached ? '已缓存' : '未缓存'}
                  variant={asset.isCached ? 'success' : 'neutral'}
                />
              </td>
              <td>
                <div className={sharedStyles.stackText}>
                  <span>{asset.filePath}</span>
                  <a
                    className={styles.inlineLink}
                    href={asset.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    打开资源
                  </a>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
