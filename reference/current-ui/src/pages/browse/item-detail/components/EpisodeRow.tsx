import { Link } from 'react-router';
import type { MediaCardSummary } from '@/domains/browse';
import styles from '../../BrowsePages.module.css';
import { buildEpisodeRowTitle } from '../formUtils';

interface EpisodeRowProps {
  episode: MediaCardSummary;
}

export function EpisodeRow({ episode }: EpisodeRowProps) {
  const playbackId = episode.playbackTargetId ?? episode.id;
  const artwork =
    episode.artwork.bannerUrl ??
    episode.artwork.backdropUrl ??
    episode.artwork.thumbUrl ??
    episode.artwork.posterUrl;
  const meta = [
    episode.subtitle,
    episode.resolutionLabel,
    episode.durationSeconds ? `${Math.max(1, Math.round(episode.durationSeconds / 60))} 分钟` : undefined,
  ]
    .filter((entry): entry is string => Boolean(entry))
    .join(' · ');

  return (
    <div className={styles.episodeRow}>
      <Link className={styles.episodeCardMedia} to={`/item/${episode.id}`}>
        {artwork ? (
          <img alt={episode.title} className={styles.episodeCardImage} src={artwork} />
        ) : (
          <div className={styles.episodeCardFallback}>暂无剧照</div>
        )}
        <span className={styles.episodeCardIndex}>
          {episode.episodeNumber ? `第 ${episode.episodeNumber} 集` : episode.kindLabel}
        </span>
        {episode.resolutionLabel ? (
          <span className={`${styles.posterCornerBadge} ${styles.posterBadgeTopRight} ${styles.posterResolutionBadge}`}>
            {episode.resolutionLabel}
          </span>
        ) : null}
        {!episode.hasPlayableSource ? (
          <span className={`${styles.posterCornerBadge} ${styles.posterBadgeBottomRight} ${styles.posterFeatureBadge}`}>
            当前源待恢复
          </span>
        ) : null}
        {episode.progress ? (
          <div className={styles.posterProgress}>
            <div
              className={styles.posterProgressFill}
              style={{ width: `${episode.progress.progressPercent}%` }}
            />
          </div>
        ) : null}
      </Link>
      <div className={styles.episodeRowCopy}>
        <Link className={styles.cardTitleLink} to={`/item/${episode.id}`}>
          <strong className={styles.episodeRowTitle}>{buildEpisodeRowTitle(episode)}</strong>
        </Link>
        <span className={styles.episodeRowMeta}>{meta || '可直接进入本集详情'}</span>
        {episode.description ? (
          <p className={styles.episodeRowDescription}>{episode.description}</p>
        ) : null}
      </div>
      <div className={styles.episodeRowActions}>
        <Link className={styles.secondaryButton} to={`/item/${episode.id}`}>
          详情
        </Link>
        <Link className={styles.primaryButton} to={`/play/${playbackId}`}>
          播放本集
        </Link>
      </div>
    </div>
  );
}
