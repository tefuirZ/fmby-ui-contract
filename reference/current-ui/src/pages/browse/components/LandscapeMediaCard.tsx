import { useMemo } from 'react';
import { Play } from 'lucide-react';
import { Link } from 'react-router';
import { usePosterUrl, useBackdropUrl, generatePlaceholderColor } from '@/shared/hooks/usePosterUrl';
import type { MediaCardSummary } from '@/domains/browse';
import type { ArtworkSet } from '@/domains/assets';
import styles from '../BrowsePages.module.css';

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

function useWideArtworkUrl(artwork: ArtworkSet) {
  const wideArtwork = useMemo(
    () => ({
      ...artwork,
      posterUrl: undefined,
    }),
    [artwork],
  );
  return useBackdropUrl(wideArtwork);
}

export function LandscapeMediaCard({ item }: { item: MediaCardSummary }) {
  const { url: backdropCandidate, onError: onBackdropError } = useWideArtworkUrl(item.artwork);
  const { url: posterCandidate, onError: onPosterError } = usePosterUrl(item.artwork);
  const backdrop = item.availabilityNotice ? undefined : backdropCandidate;
  const poster = item.availabilityNotice ? undefined : posterCandidate;
  const image = backdrop ?? poster;
  const progressLabel = buildCardProgressLabel(item);
  const playbackTargetId = resolvePlayableTargetId(item);

  return (
    <article className={styles.landscapeCard}>
      <Link className={styles.landscapeMediaLink} to={playbackTargetId ? `/play/${playbackTargetId}` : `/item/${item.id}`}>
        <div className={styles.landscapeImageWrap}>
          {image ? (
            <img
              alt={item.title}
              className={styles.landscapeImage}
              src={image}
              onError={backdrop ? onBackdropError : onPosterError}
              loading="lazy"
            />
          ) : (
            <div
              className={styles.imageFallback}
              style={{
                background: generatePlaceholderColor(item.title),
                fontSize: '2.4rem',
                fontWeight: 700,
              }}
            >
              {item.title.charAt(0)}
            </div>
          )}
          <div className={styles.landscapeOverlay} />
          {item.progress ? (
            <div className={styles.landscapeProgress}>
              <div className={styles.posterProgressFill} style={{ width: `${item.progress.progressPercent}%` }} />
            </div>
          ) : null}
          <span
            className={styles.landscapePlayPill}
            data-state={playbackTargetId ? 'playable' : 'unavailable'}
          >
            <Play size={14} />
            {playbackTargetId ? (item.progress ? '继续播放' : '立即播放') : '暂不可播放'}
          </span>
        </div>
      </Link>
      <div className={styles.landscapeBody}>
        <div className={styles.cardMetaRow}>
          <span className={styles.microChip}>{item.kindLabel}</span>
          {item.year ? <span className={styles.metaText}>{item.year}</span> : null}
          {item.resolutionLabel ? <span className={styles.metaText}>{item.resolutionLabel}</span> : null}
        </div>
        <Link className={styles.cardTitleLink} to={`/item/${item.id}`}>
          <h3 className={styles.cardTitle}>{item.title}</h3>
        </Link>
        {item.availabilityNotice ? (
          <div className={styles.cardNotice}>{item.availabilityNotice}</div>
        ) : null}
        {progressLabel ? <div className={styles.cardMeta}>{progressLabel}</div> : null}
      </div>
    </article>
  );
}
