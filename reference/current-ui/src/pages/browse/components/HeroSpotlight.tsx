import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Link } from 'react-router';
import { usePosterUrl, useBackdropUrl, generatePlaceholderColor } from '@/shared/hooks/usePosterUrl';
import type { BrowseHero, MediaCardSummary } from '@/domains/browse';
import type { ArtworkSet } from '@/domains/assets';
import { PosterBadges, buildPosterBadgeModel } from '../PosterBadges';
import { MediaProgressBar } from './MediaProgressBar';
import { AdaptiveWideBackdrop } from './AdaptiveWideBackdrop';
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

function shouldReduceMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

export function buildMediaMeta(item: MediaCardSummary) {
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

function HeroSlideThumb({
  hero,
  active,
  index,
  onSelect,
}: {
  hero: BrowseHero;
  active: boolean;
  index: number;
  onSelect: () => void;
}) {
  const { url: candidateUrl, onError } = useWideArtworkUrl(hero.item.artwork);
  const url = hero.item.availabilityNotice ? undefined : candidateUrl;
  const meta = buildMediaMeta(hero.item).slice(0, 2).join(' · ') || hero.item.kindLabel;

  return (
    <button
      className={styles.heroThumb}
      type="button"
      data-active={active ? 'true' : 'false'}
      onClick={onSelect}
      aria-label={`切换到热播内容 ${hero.item.title}`}
      aria-current={active ? 'true' : undefined}
    >
      <span className={styles.heroThumbIndex}>{index + 1}</span>
      <span className={styles.heroThumbImageWrap}>
        {url ? (
          <img className={styles.heroThumbImage} src={url} alt="" aria-hidden="true" onError={onError} />
        ) : (
          <span
            className={styles.heroThumbFallback}
            style={{ background: generatePlaceholderColor(hero.item.title) }}
          >
            {hero.item.title.charAt(0)}
          </span>
        )}
      </span>
      <span className={styles.heroThumbText}>
        <strong>{hero.item.title}</strong>
        <span>{meta}</span>
      </span>
    </button>
  );
}

export function HeroSpotlight({
  hero,
  slides,
  adminReminder,
}: {
  hero: BrowseHero;
  slides?: BrowseHero[];
  adminReminder?: ReactNode;
}) {
  const heroSlides = useMemo(
    () => (slides && slides.length > 0 ? slides : [hero]),
    [hero, slides],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const activeHero = heroSlides[Math.min(activeIndex, heroSlides.length - 1)] ?? hero;
  const hasCarousel = heroSlides.length > 1;
  const { url: backdropCandidate, onError: onBackdropError } = useBackdropUrl(activeHero.item.artwork);
  const { url: posterCandidate, onError: onPosterError } = usePosterUrl(activeHero.item.artwork);
  const backdrop = activeHero.item.availabilityNotice ? undefined : backdropCandidate;
  const poster = activeHero.item.availabilityNotice ? undefined : posterCandidate;
  const posterBadges = buildPosterBadgeModel({
    kind: activeHero.item.kind,
    badge: activeHero.item.badge,
    tags: activeHero.item.tags,
    ratingLabel: activeHero.item.ratingLabel,
    resolutionLabel: activeHero.item.resolutionLabel,
    year: activeHero.item.year,
    itemCount: activeHero.item.itemCount,
    durationSeconds: activeHero.item.durationSeconds,
  });

  useEffect(() => {
    if (activeIndex < heroSlides.length) {
      return;
    }
    setActiveIndex(0);
  }, [activeIndex, heroSlides.length]);

  useEffect(() => {
    if (!hasCarousel || isCarouselPaused || shouldReduceMotion()) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % heroSlides.length);
    }, 8_000);

    return () => window.clearInterval(timer);
  }, [hasCarousel, heroSlides.length, isCarouselPaused]);

  const goPrev = () => {
    setActiveIndex((current) => (current - 1 + heroSlides.length) % heroSlides.length);
  };

  const goNext = () => {
    setActiveIndex((current) => (current + 1) % heroSlides.length);
  };

  return (
    <section
      className={styles.hero}
      aria-roledescription={hasCarousel ? 'carousel' : undefined}
      onMouseEnter={() => setIsCarouselPaused(true)}
      onMouseLeave={() => setIsCarouselPaused(false)}
      onFocusCapture={() => setIsCarouselPaused(true)}
      onBlurCapture={() => setIsCarouselPaused(false)}
    >
      {backdrop ? (
        <AdaptiveWideBackdrop imageUrl={backdrop} onError={onBackdropError} variant="hero" />
      ) : (
        <div
          className={styles.heroBackground}
          style={{ background: generatePlaceholderColor(activeHero.item.title) }}
        />
      )}
      <div className={styles.heroLayout}>
        <div className={styles.heroCopy}>
          <div className={styles.heroKicker}>
            <span className={styles.heroEyebrow}>{hasCarousel ? '热播轮播' : '今晚继续'}</span>
            {hasCarousel ? (
              <span className={styles.heroCounter}>{activeIndex + 1} / {heroSlides.length}</span>
            ) : null}
          </div>
          <h1 className={styles.heroTitle}>{activeHero.item.title}</h1>
          {activeHero.meta.length > 0 ? (
            <div className={styles.heroMeta}>
              {activeHero.meta.map((entry) => (
                <span key={entry} className={styles.metaChip}>
                  {entry}
                </span>
              ))}
            </div>
          ) : null}
          <p className={styles.heroDescription}>{activeHero.description}</p>
          {activeHero.item.availabilityNotice ? (
            <div className={styles.cardNotice}>{activeHero.item.availabilityNotice}</div>
          ) : null}
          <div className={styles.buttonRow}>
            <Link className={styles.primaryButton} to={activeHero.primaryActionTo}>
              {activeHero.primaryActionTo.startsWith('/play/') ? <Play size={16} /> : null}
              {activeHero.primaryActionLabel}
            </Link>
            {activeHero.secondaryActionLabel && activeHero.secondaryActionTo ? (
              <Link className={styles.secondaryButton} to={activeHero.secondaryActionTo}>
                {activeHero.secondaryActionLabel}
              </Link>
            ) : null}
          </div>
          {activeHero.item.progress ? (
            <MediaProgressBar
              value={activeHero.item.progress.progressPercent}
              label={buildCardProgressLabel(activeHero.item)}
            />
          ) : null}
          {hasCarousel ? (
            <div className={styles.heroCarouselControls} aria-label="热播轮播控制">
              <button className={styles.heroArrowButton} type="button" onClick={goPrev} aria-label="上一部热播内容">
                <ChevronLeft size={18} />
              </button>
              <div className={styles.heroDots}>
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.item.id}
                    className={styles.heroDot}
                    type="button"
                    data-active={index === activeIndex ? 'true' : 'false'}
                    aria-label={`切换到 ${slide.item.title}`}
                    aria-current={index === activeIndex ? 'true' : undefined}
                    onClick={() => setActiveIndex(index)}
                  />
                ))}
              </div>
              <button className={styles.heroArrowButton} type="button" onClick={goNext} aria-label="下一部热播内容">
                <ChevronRight size={18} />
              </button>
            </div>
          ) : null}
          {hasCarousel ? (
            <div className={styles.heroThumbRail} aria-label="热播内容缩略导航">
              {heroSlides.map((slide, index) => (
                <HeroSlideThumb
                  key={slide.item.id}
                  hero={slide}
                  active={index === activeIndex}
                  index={index}
                  onSelect={() => setActiveIndex(index)}
                />
              ))}
            </div>
          ) : null}
          {adminReminder}
        </div>
        <div className={styles.heroPosterWrap}>
          {poster ? (
            <img alt={activeHero.item.title} className={styles.heroPoster} src={poster} onError={onPosterError} />
          ) : (
            <div
              className={styles.imageFallback}
              style={{
                width: 'min(280px, 100%)',
                aspectRatio: '2/3',
                borderRadius: 22,
                background: generatePlaceholderColor(hero.item.title),
                fontSize: '3rem',
                fontWeight: 700,
              }}
            >
              {activeHero.item.title.charAt(0)}
            </div>
          )}
          <PosterBadges
            feature={posterBadges.feature}
            score={posterBadges.score}
            resolution={posterBadges.resolution}
            footer={posterBadges.footer}
          />
        </div>
      </div>
    </section>
  );
}
