import type { CSSProperties } from 'react';
import type { MediaCardSummary } from '@/domains/browse';

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

export function buildSafeBackgroundStyle(imageUrl: string, overlay?: string): CSSProperties {
  const escapedUrl = imageUrl.replace(/["\\\n\r\f]/g, '\\$&');
  return {
    backgroundImage: overlay ? `${overlay}, url("${escapedUrl}")` : `url("${escapedUrl}")`,
  };
}
