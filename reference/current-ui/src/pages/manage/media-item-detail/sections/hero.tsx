import { RotateCcw, ScanSearch } from "lucide-react";
import { Link } from "react-router";

import type { ManageMediaItemDetailRecord } from "@/domains/manage/media-items";
import { StatusBadge } from "@/shared/ui/common/StatusBadge";
import { formatDateTime, formatRelativeTime } from "@/shared/utils/date";

import {
  formatSimpleValue,
  getMetadataStatusLabel,
  getMetadataStatusVariant,
  getSourceStatusLabel,
  getSourceStatusVariant,
  type ResourceContext,
} from "../helpers";
import { AssetPreview } from "../presentation";
import sharedStyles from "../../ManagePages.module.css";
import styles from "../../ManageMediaItemDetailPage.module.css";

export function MediaItemHeroSection({
  detail,
  resourceContext,
  onRefreshMetadata,
  refreshPending,
  onScan,
  scanPending,
}: {
  detail: ManageMediaItemDetailRecord;
  resourceContext: ResourceContext;
  onRefreshMetadata: () => void;
  refreshPending: boolean;
  onScan: () => void;
  scanPending: boolean;
}) {
  const heroStyle = detail.item.backdropUrl
    ? {
        backgroundImage: `linear-gradient(135deg, rgba(8, 11, 18, 0.92), rgba(8, 11, 18, 0.58)), url(${detail.item.backdropUrl})`,
      }
    : undefined;
  const heroImageUrl =
    detail.item.mediaType === "episode"
      ? detail.item.thumbUrl ?? detail.item.posterUrl
      : detail.item.posterUrl ?? detail.item.thumbUrl;

  return (
    <section className={styles.hero} style={heroStyle}>
      <div className={styles.heroPosterWrap}>
        <AssetPreview
          title={detail.item.title}
          imageUrl={heroImageUrl}
          hint={detail.item.originalTitle ?? detail.item.typeLabel}
        />
      </div>

      <div className={styles.heroContent}>
        <div className={styles.heroEyebrow}>
          {detail.item.typeLabel} · 媒体库 {detail.item.libraryName}
        </div>
        <div className={styles.heroContextRow}>
          {resourceContext.breadcrumbs.map((crumb, index) => (
            <div key={`${crumb.label}-${index}`} className={styles.heroContextCrumb}>
              {crumb.to ? (
                <Link className={styles.heroContextLink} to={crumb.to}>
                  {crumb.label}
                </Link>
              ) : (
                <span>{crumb.label}</span>
              )}
              {index < resourceContext.breadcrumbs.length - 1 ? (
                <span className={styles.heroContextSeparator}>/</span>
              ) : null}
            </div>
          ))}
        </div>
        <h2 className={styles.heroTitle}>{detail.item.title}</h2>
        <p className={styles.heroSummary}>
          {detail.item.overview ?? "当前还没有有效概述，但这页已经具备完整的本地态编辑能力。"}
        </p>
        <div className={styles.heroBadges}>
          <StatusBadge
            label={getSourceStatusLabel(detail.item.sourceStatus)}
            variant={getSourceStatusVariant(detail.item.sourceStatus)}
          />
          <StatusBadge
            label={getMetadataStatusLabel(detail.item.metadataStatus)}
            variant={getMetadataStatusVariant(detail.item.metadataStatus)}
          />
          <StatusBadge
            label={detail.item.hasLocalOverride ? "有本地覆盖" : "无本地覆盖"}
            variant={detail.item.hasLocalOverride ? "info" : "neutral"}
          />
        </div>
        <div className={styles.heroMeta}>
          <span>最近更新 {formatRelativeTime(detail.item.updatedAt)}</span>
          <span>最近扫描 {formatDateTime(detail.item.lastScanAt)}</span>
          <span>评分 {formatSimpleValue(detail.item.communityRating)}</span>
        </div>
        <div className={styles.heroActions}>
          <button
            className={sharedStyles.primaryButton}
            type="button"
            onClick={onRefreshMetadata}
            disabled={refreshPending}
          >
            <RotateCcw size={16} />
            {refreshPending ? "刷新中…" : "刷新元数据"}
          </button>
          <button
            className={sharedStyles.secondaryButton}
            type="button"
            onClick={onScan}
            disabled={scanPending}
          >
            <ScanSearch size={16} />
            {scanPending ? "排队中…" : "发起重扫"}
          </button>
        </div>
      </div>
    </section>
  );
}
