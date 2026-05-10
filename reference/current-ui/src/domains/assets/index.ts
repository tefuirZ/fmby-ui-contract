import { asRecord, readString } from '@/shared/api/mapping';

export interface ArtworkSet {
  bannerUrl?: string;
  posterUrl?: string;
  backdropUrl?: string;
  thumbUrl?: string;
  logoUrl?: string;
}

export function buildItemArtworkUrl(itemId: string, kind: 'banner' | 'poster' | 'backdrop' | 'thumb' | 'logo') {
  return `/api/assets/items/${itemId}/images/${kind}`;
}

export function buildLibraryArtworkUrl(
  libraryId: string,
  kind: 'banner' | 'poster' | 'backdrop' | 'thumb' | 'logo',
) {
  return `/api/assets/libraries/${libraryId}/images/${kind}`;
}

export function mapArtwork(
  value: unknown,
  options?: {
    itemId?: string;
    libraryId?: string;
    fallbackItemUrls?: boolean;
    fallbackLibraryUrls?: boolean;
  },
): ArtworkSet {
  const raw = asRecord(value);

  const explicitBannerUrl = readString(raw.banner_url, raw.bannerUrl);

  const posterUrl =
    readString(raw.poster_url, raw.posterUrl, raw.primary_url, raw.primaryUrl) ??
    (options?.fallbackItemUrls && options.itemId
      ? buildItemArtworkUrl(options.itemId, 'poster')
      : options?.fallbackLibraryUrls && options.libraryId
        ? buildLibraryArtworkUrl(options.libraryId, 'poster')
        : undefined);

  const backdropUrl =
    readString(raw.backdrop_url, raw.backdropUrl, raw.background_url, raw.backgroundUrl) ??
    (options?.fallbackItemUrls && options.itemId
      ? buildItemArtworkUrl(options.itemId, 'backdrop')
      : options?.fallbackLibraryUrls && options.libraryId
        ? buildLibraryArtworkUrl(options.libraryId, 'backdrop')
        : undefined);

  const thumbUrl =
    readString(raw.thumb_url, raw.thumbUrl, raw.thumbnail_url, raw.thumbnailUrl) ??
    (options?.fallbackItemUrls && options.itemId
      ? buildItemArtworkUrl(options.itemId, 'thumb')
      : options?.fallbackLibraryUrls && options.libraryId
        ? buildLibraryArtworkUrl(options.libraryId, 'thumb')
        : undefined);

  const logoUrl =
    readString(raw.logo_url, raw.logoUrl) ??
    (options?.fallbackItemUrls && options.itemId
      ? buildItemArtworkUrl(options.itemId, 'logo')
      : options?.fallbackLibraryUrls && options.libraryId
        ? buildLibraryArtworkUrl(options.libraryId, 'logo')
        : undefined);

  const bannerUrl =
    explicitBannerUrl ??
    ((backdropUrl || thumbUrl || posterUrl) && options?.itemId
      ? buildItemArtworkUrl(options.itemId, 'banner')
      : (backdropUrl || thumbUrl || posterUrl) && options?.libraryId
        ? buildLibraryArtworkUrl(options.libraryId, 'banner')
        : undefined);

  return {
    bannerUrl,
    posterUrl,
    backdropUrl,
    thumbUrl,
    logoUrl,
  };
}
