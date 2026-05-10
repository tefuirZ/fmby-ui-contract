import { Link } from 'react-router';
import type { ItemDetailResponse } from '@/domains/item';
import { PosterBadges, buildPosterBadgeModel } from '../../PosterBadges';
import { MediaProgressBar, SmallStat } from '../../components';
import { InlineBanner } from '@/shared/ui/common/InlineBanner';
import { formatDateTime, formatDuration } from '@/shared/utils/date';
import styles from '../../BrowsePages.module.css';

interface ItemDetailHeroProps {
  item: ItemDetailResponse;
  posterBadges: ReturnType<typeof buildPosterBadgeModel>;
}

export function ItemDetailHero({ item, posterBadges }: ItemDetailHeroProps) {
  const backdrop =
    item.artwork.bannerUrl ??
    item.artwork.backdropUrl ??
    item.artwork.thumbUrl ??
    item.artwork.posterUrl;
  const poster =
    item.kind === 'episode'
      ? item.artwork.thumbUrl ?? item.artwork.posterUrl
      : item.artwork.posterUrl ?? item.artwork.thumbUrl;
  const playbackItemId = item.playbackTargetId ?? item.id;

  return (
    <section className={styles.detailHero}>
      <div
        className={styles.detailBackdrop}
        style={backdrop ? { backgroundImage: `url(${backdrop})` } : undefined}
      />
      <div className={styles.detailLayout}>
        <div className={styles.detailPosterColumn}>
          <div className={styles.detailPosterWrap}>
            {poster ? (
              <img alt={item.title} className={styles.detailPoster} src={poster} />
            ) : (
              <div className={styles.detailPosterFallback}>暂无海报</div>
            )}
            <PosterBadges
              feature={posterBadges.feature}
              score={posterBadges.score}
              resolution={posterBadges.resolution}
              footer={posterBadges.footer}
            />
          </div>
        </div>
        <div className={styles.detailCopy}>
          <div className={styles.eyebrow}>{item.kindLabel}</div>
          <h1 className={styles.detailTitle}>{item.title}</h1>
          {item.originalTitle && item.originalTitle !== item.title ? (
            <div className={styles.detailSubtitle}>{item.originalTitle}</div>
          ) : null}
          {item.tagline ? <div className={styles.detailSubtitle}>{item.tagline}</div> : null}
          <div className={styles.detailMeta}>
            {item.meta.map((entry) => (
              <span key={entry} className={styles.metaChip}>
                {entry}
              </span>
            ))}
          </div>
          <div className={styles.detailButtonRow}>
            <Link className={styles.primaryButton} to={`/play/${playbackItemId}`}>
              {item.primaryActionLabel}
            </Link>
            {item.library?.id ? (
              <Link className={styles.secondaryButton} to={`/libraries/${item.library.id}`}>
                {item.secondaryActionLabel ?? '查看所在媒体库'}
              </Link>
            ) : null}
          </div>
          {item.progress ? (
            <MediaProgressBar
              value={item.progress.progressPercent}
              label={
                item.progress.remainingLabel ??
                `已观看 ${Math.round(item.progress.progressPercent)}%`
              }
            />
          ) : null}
          {!item.canPlay ? (
            <InlineBanner
              variant="warning"
              title="当前内容暂时无法直接播放"
              description="可以先查看技术信息，或稍后再试。"
            />
          ) : null}
          <p className={styles.detailSummary}>{item.description}</p>
          {item.genres.length > 0 || item.tags.length > 0 ? (
            <div className={styles.detailTagRow}>
              {[...item.genres, ...item.tags].map((tag) => (
                <span key={tag} className={styles.detailTag}>
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
          <div className={styles.smallStatsGrid}>
            <SmallStat label="时长" value={formatDuration(item.runtimeSeconds)} icon="time" />
            <SmallStat label="评分" value={item.ratingLabel ?? '未提供'} icon="score" />
            <SmallStat label="最近播放" value={formatDateTime(item.lastPlayedAt)} />
            <SmallStat label="最近入库" value={formatDateTime(item.addedAt)} />
          </div>
        </div>
      </div>
    </section>
  );
}
