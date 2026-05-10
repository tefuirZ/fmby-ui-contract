import type { ManageMediaItemDetailRecord } from "@/domains/manage/media-items";
import { formatDateTime } from "@/shared/utils/date";

import { getMetadataStatusLabel, type SourceDeleteState } from "../helpers";
import { SourceCard } from "../presentation";
import sharedStyles from "../../ManagePages.module.css";
import styles from "../../ManageMediaItemDetailPage.module.css";
import { ManageSectionCard } from "../../components";

export function SourcesSection({
  detail,
  deletingSourceId,
  onRequestDeleteSource,
}: {
  detail: ManageMediaItemDetailRecord;
  deletingSourceId?: string;
  onRequestDeleteSource: (source: SourceDeleteState) => void;
}) {
  return (
    <ManageSectionCard
      title="来源与探测"
      description="这里只保留管理员真正需要的来源卡片：挂载、状态、文件路径和基础探测信息。"
    >
      {detail.sources.length === 0 ? (
        <div className={sharedStyles.emptyInlineState}>当前资源还没有来源记录。</div>
      ) : (
        <div className={styles.sourceGrid}>
          {detail.sources.map((source) => (
            <SourceCard
              key={source.id}
              source={source}
              onDelete={onRequestDeleteSource}
              deleting={deletingSourceId === source.id}
            />
          ))}
        </div>
      )}
    </ManageSectionCard>
  );
}

export function RawMetadataSection({ detail }: { detail: ManageMediaItemDetailRecord }) {
  return (
    <ManageSectionCard title="原始元数据" description="这块保持只读，便于排查 NFO 解析和合成结果。">
      <pre className={sharedStyles.jsonBlock}>
        {detail.latestMetadataRawContent ?? "当前没有可展示的原始 NFO 内容。"}
      </pre>
    </ManageSectionCard>
  );
}

export function StatusRailSection({ detail }: { detail: ManageMediaItemDetailRecord }) {
  return (
    <ManageSectionCard
      title="状态轨"
      description="把这条资源现在最重要的状态钉在右侧，保存前后都能一眼看明白。"
    >
      <div className={sharedStyles.detailSummaryGrid}>
        <div className={sharedStyles.detailCard}>
          <span className={sharedStyles.detailCardLabel}>元数据状态</span>
          <span className={sharedStyles.detailCardValue}>
            {getMetadataStatusLabel(detail.metadataStatus.status)}
          </span>
        </div>
        <div className={sharedStyles.detailCard}>
          <span className={sharedStyles.detailCardLabel}>远端元数据</span>
          <span className={sharedStyles.detailCardValue}>
            {detail.metadataStatus.hasRemoteMetadata ? "已发现" : "缺失"}
          </span>
        </div>
        <div className={sharedStyles.detailCard}>
          <span className={sharedStyles.detailCardLabel}>本地元数据覆盖</span>
          <span className={sharedStyles.detailCardValue}>
            {detail.metadataStatus.hasLocalOverride ? "已启用" : "未启用"}
          </span>
        </div>
        <div className={sharedStyles.detailCard}>
          <span className={sharedStyles.detailCardLabel}>最近解析</span>
          <span className={sharedStyles.detailCardValue}>
            {formatDateTime(detail.metadataStatus.parsedAt)}
          </span>
        </div>
        <div className={sharedStyles.detailCard}>
          <span className={sharedStyles.detailCardLabel}>本地图像覆盖</span>
          <span className={sharedStyles.detailCardValue}>
            {detail.item.hasLocalArtworkOverride ? "已启用" : "未启用"}
          </span>
        </div>
        <div className={sharedStyles.detailCard}>
          <span className={sharedStyles.detailCardLabel}>本地字幕覆盖</span>
          <span className={sharedStyles.detailCardValue}>
            {detail.item.hasLocalSubtitleOverride ? "已启用" : "未启用"}
          </span>
        </div>
      </div>
    </ManageSectionCard>
  );
}
