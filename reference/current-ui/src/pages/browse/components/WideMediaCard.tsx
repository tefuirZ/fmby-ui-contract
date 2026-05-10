import { Clock3, Play } from 'lucide-react';
import { Link } from 'react-router';
import { StatusBadge } from '@/shared/ui/common/StatusBadge';
import { formatRelativeTime } from '@/shared/utils/date';
import type { MediaCardSummary } from '@/domains/browse';
import type { ArtworkSet } from '@/domains/assets';
import { MediaProgressBar } from './MediaProgressBar';
import styles from '../BrowsePages.module.css';

function buildMediaMeta(item: MediaCardSummary) {
  const runtimeLabel =
    item.kind === 'series' || item.kind === 'season'
      ? item.itemCount
        ? `${item.itemCount} 集`
        : undefined
      : item.durationSeconds
        ? formatCompactDuration(item.durationSeconds)
        : undefined;

  return [
    item.year ? String(item.year) : undefined,
    item.kindLabel,
    runtimeLabel,
    item.resolutionLabel,
    item.ratingLabel,
  ].filter((entry): entry is string => Boolean(entry));
}

function formatCompactDuration(seconds?: number) {
  if (!seconds) return undefined;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}小时${minutes > 0 ? `${minutes}分` : ''}`;
  }
  return `${minutes}分`;
}

function buildCardProgressLabel(item: MediaCardSummary) {
  if (!item.progress) {
    return undefined;
  }

  if (item.progress.completed) {
    return '已看完';
  }

  const contextLabel = normalizeCardContextLabel(item.progress.remainingLabel ?? item.subtitle);
  return contextLabel ?? `已观看 ${Math.round(item.progress.progressPercent)}%`;
}

function normalizeCardContextLabel(value?: string) {
  if (!value) {
    return undefined;
  }

  const normalized = value
    .replace(/^(播放到|更新至)\s*/u, '')
    .replace(/\s+/gu, ' ')
    .trim();

  return normalized || undefined;
}

function resolvePlayableTargetId(item: MediaCardSummary) {
  if (item.availabilityNotice) {
    return undefined;
  }

  return item.playbackTargetId ?? (item.hasPlayableSource ? item.id : undefined);
}

function pickWideArtworkUrl(artwork: ArtworkSet): string | null {
  return artwork.bannerUrl ?? artwork.backdropUrl ?? artwork.thumbUrl ?? null;
}

export function WideMediaCard({
  item,
  primaryLabel = '继续播放',
}: {
  item: MediaCardSummary;
  primaryLabel?: string;
}) {
  const image = item.availabilityNotice ? undefined : pickWideArtworkUrl(item.artwork);
  const progressLabel = buildCardProgressLabel(item);
  const playbackTargetId = resolvePlayableTargetId(item);

  return (
    <article className={styles.wideCard}>
      <Link className={styles.wideThumbLink} to={`/item/${item.id}`}>
        {image ? <img alt={item.title} className={styles.wideThumb} src={image} /> : <div className={styles.imageFallback}>暂无封面</div>}
      </Link>
      <div className={styles.wideBody}>
        <div className={styles.cardMetaRow}>
          <StatusBadge
            label={item.kindLabel}
            variant={item.progress?.completed ? 'success' : item.progress ? 'warning' : 'info'}
          />
          {item.lastPlayedAt ? (
            <span className={styles.metaText}>
              <Clock3 size={14} />
              {formatRelativeTime(item.lastPlayedAt)}
            </span>
          ) : null}
        </div>
        <Link className={styles.cardTitleLink} to={`/item/${item.id}`}>
          <h3 className={styles.cardTitle}>{item.title}</h3>
        </Link>
        <div className={styles.cardMeta}>{buildMediaMeta(item).join(' · ')}</div>
        {item.description ? <p className={styles.cardDescription}>{item.description}</p> : null}
        {item.availabilityNotice ? (
          <div className={styles.cardNotice}>{item.availabilityNotice}</div>
        ) : null}
        {item.progress ? (
          <MediaProgressBar value={item.progress.progressPercent} label={progressLabel} />
        ) : null}
        <div className={styles.buttonRow}>
          {playbackTargetId ? (
            <Link className={styles.primaryButton} to={`/play/${playbackTargetId}`}>
              <Play size={16} />
              {item.progress ? primaryLabel : '立即播放'}
            </Link>
          ) : (
            <span className={styles.ghostButton} aria-disabled="true">
              暂不可播放
            </span>
          )}
          <Link className={styles.ghostButton} to={`/item/${item.id}`}>
            查看详情
          </Link>
        </div>
      </div>
    </article>
  );
}
