import { Link } from 'react-router';
import { usePosterUrl, generatePlaceholderColor } from '@/shared/hooks/usePosterUrl';
import { formatCompactDuration } from '@/shared/utils/date';
import type { MediaCardSummary } from '@/domains/browse';
import { PosterBadges, buildPosterBadgeModel } from '../PosterBadges';
import styles from '../BrowsePages.module.css';

function buildPosterDisplayTitle(item: MediaCardSummary) {
  if (item.kind === 'season') {
    return item.seasonName ?? (item.seasonNumber ? `第 ${item.seasonNumber} 季` : item.title);
  }
  return item.title;
}

function buildPosterMeta(item: MediaCardSummary) {
  if (item.kind === 'season') {
    return item.seriesName ?? item.subtitle ?? undefined;
  }
  return item.subtitle ?? item.resolutionLabel ?? formatCompactDuration(item.durationSeconds);
}

export function PosterMediaCard({ item }: { item: MediaCardSummary }) {
  const { url: posterCandidate, onError } = usePosterUrl(item.artwork);
  const image = item.availabilityNotice ? undefined : posterCandidate;
  const badges = buildPosterBadgeModel({
    kind: item.kind,
    badge: item.badge,
    tags: item.tags,
    ratingLabel: item.ratingLabel,
    resolutionLabel: item.resolutionLabel,
    year: item.year,
    itemCount: item.itemCount,
    durationSeconds: item.durationSeconds,
  });
  const displayTitle = buildPosterDisplayTitle(item);
  const displayMeta = buildPosterMeta(item);

  return (
    <article className={styles.posterCard} data-kind={item.kind}>
      <Link className={styles.posterLink} to={`/item/${item.id}`}>
        <div className={styles.posterImageWrap}>
          {image ? (
            <img alt={displayTitle} className={styles.posterImage} src={image} onError={onError} loading="lazy" />
          ) : (
            <div
              className={styles.posterArtworkFallback}
              style={{
                background: generatePlaceholderColor(displayTitle),
              }}
            >
              <span className={styles.posterArtworkInitial}>{displayTitle.charAt(0)}</span>
              <span className={styles.posterArtworkType}>{item.kindLabel}</span>
            </div>
          )}
          <PosterBadges
            feature={badges.feature}
            score={badges.score}
            resolution={badges.resolution}
            footer={badges.footer}
          />
          {item.progress ? (
            <div className={styles.posterProgress}>
              <div className={styles.posterProgressFill} style={{ width: `${item.progress.progressPercent}%` }} />
            </div>
          ) : null}
        </div>
        <div className={styles.posterBody}>
          <div className={styles.cardMetaRow}>
            <span className={styles.microChip}>{item.kindLabel}</span>
            {item.year ? <span className={styles.metaText}>{item.year}</span> : null}
          </div>
          <h3 className={styles.cardTitle}>{displayTitle}</h3>
          {item.availabilityNotice ? (
            <div className={styles.cardNotice}>{item.availabilityNotice}</div>
          ) : null}
          {displayMeta ? <div className={styles.cardMeta}>{displayMeta}</div> : null}
        </div>
      </Link>
    </article>
  );
}
