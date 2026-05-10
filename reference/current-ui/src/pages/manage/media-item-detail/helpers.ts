import type { StatusBadgeVariant } from '@/shared/ui/common/StatusBadge';
import type {
  ManageMediaItemArtworkKind,
  ManageMediaItemArtworkOverrideRecord,
  ManageMediaItemDetailRecord,
  ManageMediaItemMetadataRecord,
  ManageMediaItemMetadataStatus,
  ManageMediaItemScrapedArtworkRecord,
  ManageMediaItemSourceStatus,
  ManageMediaItemSubtitleOverrideRecord,
  UpdateManageMediaItemMetadataRequest,
  UpdateManageMediaPersonInput,
} from '@/domains/manage/media-items';

export type ArtworkDeleteState = Pick<
  ManageMediaItemArtworkOverrideRecord,
  'id' | 'artworkKind' | 'originalFilename'
>;

export type SourceDeleteState = {
  id: string;
  mountName: string;
  filePath: string;
  sourceStatus: ManageMediaItemSourceStatus;
};

export type SubtitleDeleteState = Pick<
  ManageMediaItemSubtitleOverrideRecord,
  'id' | 'originalFilename'
>;

export interface MetadataFormState {
  title: string;
  originalTitle: string;
  sortTitle: string;
  year: string;
  overview: string;
  communityRating: string;
  genres: string;
  directors: string;
  actors: string;
  studios: string;
  premiered: string;
}

export interface MetadataFormErrors {
  year?: string;
  communityRating?: string;
  premiered?: string;
  actors?: string;
}

export interface SubtitleUploadState {
  file: File | null;
  language: string;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: string;
}

export interface SubtitleDraftState {
  language: string;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: string;
}

interface NormalizedMetadataDraft {
  title?: string;
  originalTitle?: string;
  sortTitle?: string;
  year?: number;
  overview?: string;
  communityRating?: number;
  genres: string[];
  directors: string[];
  actors: UpdateManageMediaPersonInput[];
  studios: string[];
  premiered?: string;
}

export const ARTWORK_KINDS: Array<{
  kind: ManageMediaItemArtworkKind;
  label: string;
  hint: string;
}> = [
  { kind: 'poster', label: 'Poster', hint: '主海报' },
  { kind: 'backdrop', label: 'Backdrop', hint: '背景图' },
  { kind: 'thumb', label: 'Thumb', hint: '缩略图' },
];

export function getSourceStatusLabel(status: ManageMediaItemSourceStatus) {
  switch (status) {
    case 'playable':
      return '可播放';
    case 'pending-validation':
      return '待校验';
    case 'unreachable':
      return '不可达';
    case 'unsupported':
      return '不支持';
    case 'auth-expired':
      return '凭证过期';
    default:
      return '状态缺失';
  }
}

export function getSourceStatusVariant(
  status: ManageMediaItemSourceStatus,
): StatusBadgeVariant {
  switch (status) {
    case 'playable':
      return 'success';
    case 'pending-validation':
      return 'warning';
    case 'unreachable':
    case 'unsupported':
    case 'auth-expired':
      return 'danger';
    default:
      return 'neutral';
  }
}

export function getMetadataStatusLabel(status: ManageMediaItemMetadataStatus) {
  switch (status) {
    case 'success':
      return '元数据正常';
    case 'pending':
      return '等待解析';
    case 'failed':
      return '解析失败';
    default:
      return '元数据缺失';
  }
}

export function getMetadataStatusVariant(
  status: ManageMediaItemMetadataStatus,
): StatusBadgeVariant {
  switch (status) {
    case 'success':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
      return 'danger';
    default:
      return 'neutral';
  }
}

export function getArtworkKindLabel(kind: ManageMediaItemArtworkKind) {
  switch (kind) {
    case 'poster':
      return 'Poster';
    case 'backdrop':
      return 'Backdrop';
    case 'thumb':
      return 'Thumb';
    default:
      return kind;
  }
}

export function formatSimpleValue(value?: string | number | null) {
  if (value === null || value === undefined || value === '') {
    return '未提供';
  }
  return String(value);
}

export function formatListValue(values: string[]) {
  return values.length > 0 ? values.join('、') : '未提供';
}

export function formatActorValue(actors: UpdateManageMediaPersonInput[]) {
  if (actors.length === 0) {
    return '未提供';
  }
  return actors
    .map((actor) => (actor.role ? `${actor.name} · ${actor.role}` : actor.name))
    .join('、');
}

export function formatBytes(size?: number) {
  if (!size || size <= 0) {
    return '—';
  }
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = size;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function serializeActors(actors: { name: string; role?: string }[]) {
  return actors
    .map((actor) => (actor.role ? `${actor.name} | ${actor.role}` : actor.name))
    .join('\n');
}

export function buildFormState(detail: ManageMediaItemDetailRecord): MetadataFormState {
  const metadata = detail.effectiveMetadata;
  return {
    title: metadata.title ?? '',
    originalTitle: metadata.originalTitle ?? '',
    sortTitle: metadata.sortTitle ?? '',
    year: metadata.year ? String(metadata.year) : '',
    overview: metadata.overview ?? '',
    communityRating:
      metadata.communityRating !== undefined ? String(metadata.communityRating) : '',
    genres: metadata.genres.join(', '),
    directors: metadata.directors.join(', '),
    actors: serializeActors(metadata.actors),
    studios: metadata.studios.join(', '),
    premiered: metadata.premiered ?? '',
  };
}

export function buildSubtitleDrafts(detail: ManageMediaItemDetailRecord) {
  return detail.subtitleOverrides.reduce<Record<string, SubtitleDraftState>>((acc, item) => {
    acc[item.id] = {
      language: item.language ?? '',
      isActive: item.isActive,
      isDefault: item.isDefault,
      sortOrder: String(item.sortOrder),
    };
    return acc;
  }, {});
}

export function createEmptySubtitleUploadState(): SubtitleUploadState {
  return {
    file: null,
    language: '',
    isActive: true,
    isDefault: false,
    sortOrder: '0',
  };
}

export type ResourceBreadcrumb = {
  label: string;
  to?: string;
};

export interface ResourceContext {
  breadcrumbs: ResourceBreadcrumb[];
  ancestorChipLabels: string[];
}

export function buildResourceContext(detail: ManageMediaItemDetailRecord): ResourceContext {
  const current = detail.item;
  const breadcrumbs: ResourceBreadcrumb[] = [{ label: current.libraryName }];
  const ancestorChipLabels: string[] = [];

  if (current.mediaType === 'series') {
    breadcrumbs.push({ label: current.title });
  } else if (current.mediaType === 'season') {
    if (current.seriesTitle) {
      ancestorChipLabels.push(`剧集 ${current.seriesTitle}`);
      breadcrumbs.push({
        label: current.seriesTitle,
        to: current.seriesId ? `/manage/media/items/${current.seriesId}` : undefined,
      });
    }
    breadcrumbs.push({ label: current.title });
  } else if (current.mediaType === 'episode') {
    const seasonLabel =
      current.seasonTitle ??
      (current.seasonNumber ? `第 ${current.seasonNumber} 季` : undefined);

    if (current.seriesTitle) {
      ancestorChipLabels.push(`剧集 ${current.seriesTitle}`);
      breadcrumbs.push({
        label: current.seriesTitle,
        to: current.seriesId ? `/manage/media/items/${current.seriesId}` : undefined,
      });
    }
    if (seasonLabel) {
      ancestorChipLabels.push(`季度 ${seasonLabel}`);
      breadcrumbs.push({
        label: seasonLabel,
        to: current.seasonId ? `/manage/media/items/${current.seasonId}` : undefined,
      });
    }
    breadcrumbs.push({ label: buildCurrentItemLabel(current) });
  } else {
    breadcrumbs.push({ label: current.title });
  }

  return {
    breadcrumbs,
    ancestorChipLabels,
  };
}

function buildCurrentItemLabel(item: ManageMediaItemDetailRecord['item']) {
  if (item.mediaType === 'episode' && item.episodeNumber) {
    return `第 ${item.episodeNumber} 集`;
  }
  if (item.mediaType === 'season' && item.seasonNumber) {
    return `第 ${item.seasonNumber} 季`;
  }
  return item.title;
}

function splitTextList(value: string) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of value.split(/[\n,，]/)) {
    const normalized = item.trim();
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    result.push(normalized);
  }
  return result;
}

function parseActorsInput(value: string) {
  const result: UpdateManageMediaPersonInput[] = [];
  const lines = value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  for (const line of lines) {
    const [namePart, ...roleParts] = line.split('|');
    const name = namePart?.trim() ?? '';
    const role = roleParts.join('|').trim();
    result.push({
      name,
      role: role || undefined,
    });
  }
  return result;
}

function normalizeDraft(form: MetadataFormState): NormalizedMetadataDraft {
  const normalizedYear = form.year.trim();
  const normalizedRating = form.communityRating.trim();
  return {
    title: form.title.trim() || undefined,
    originalTitle: form.originalTitle.trim() || undefined,
    sortTitle: form.sortTitle.trim() || undefined,
    year: normalizedYear ? Number(normalizedYear) : undefined,
    overview: form.overview.trim() || undefined,
    communityRating: normalizedRating ? Number(normalizedRating) : undefined,
    genres: splitTextList(form.genres),
    directors: splitTextList(form.directors),
    actors: parseActorsInput(form.actors),
    studios: splitTextList(form.studios),
    premiered: form.premiered.trim() || undefined,
  };
}

export function validateForm(form: MetadataFormState): MetadataFormErrors {
  const errors: MetadataFormErrors = {};
  const draft = normalizeDraft(form);
  if (form.year.trim() !== '') {
    if (!Number.isInteger(draft.year) || (draft.year ?? 0) < 1800 || (draft.year ?? 0) > 3000) {
      errors.year = '年份必须是 1800 到 3000 之间的整数。';
    }
  }
  if (form.communityRating.trim() !== '') {
    const rating = draft.communityRating;
    if (rating === undefined || !Number.isFinite(rating) || rating < 0 || rating > 10) {
      errors.communityRating = '评分必须是 0 到 10 之间的数字。';
    }
  }
  if (form.premiered.trim() !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(form.premiered.trim())) {
    errors.premiered = '首映日期必须使用 YYYY-MM-DD。';
  }
  if (draft.actors.some((actor) => !actor.name.trim())) {
    errors.actors = '演员列表每一行都必须有名称，格式建议用 “姓名 | 角色”。';
  }
  return errors;
}

export function buildBaselineMetadata(detail: ManageMediaItemDetailRecord) {
  return detail.remoteMetadata?.metadata ?? detail.baseMetadata;
}

export function buildArtworkByKind(
  detail: ManageMediaItemDetailRecord,
): Record<ManageMediaItemArtworkKind, ManageMediaItemArtworkOverrideRecord | undefined> {
  const overrides = detail.artworkOverrides ?? [];
  return {
    poster: overrides.find((item) => item.isActive && item.artworkKind === 'poster'),
    backdrop: overrides.find(
      (item) => item.isActive && item.artworkKind === 'backdrop',
    ),
    thumb: overrides.find((item) => item.isActive && item.artworkKind === 'thumb'),
  };
}

export function buildScrapedArtworkByKind(
  detail: ManageMediaItemDetailRecord,
): Record<ManageMediaItemArtworkKind, ManageMediaItemScrapedArtworkRecord | undefined> {
  const artworks = detail.scrapedArtworks ?? [];
  return {
    poster: artworks.find((item) => item.kind === 'poster'),
    backdrop: artworks.find((item) => item.kind === 'backdrop'),
    thumb: artworks.find((item) => item.kind === 'thumb'),
  };
}

function actorsEqual(
  left: { name: string; role?: string }[],
  right: { name: string; role?: string }[],
) {
  if (left.length !== right.length) {
    return false;
  }
  return left.every((actor, index) => {
    const target = right[index];
    return actor.name === target?.name && (actor.role ?? undefined) === (target?.role ?? undefined);
  });
}

export function buildUpdatePayload(
  detail: ManageMediaItemDetailRecord,
  form: MetadataFormState,
): UpdateManageMediaItemMetadataRequest {
  const draft = normalizeDraft(form);
  const baseline = buildBaselineMetadata(detail);
  return {
    title: draft.title !== baseline.title ? draft.title : undefined,
    originalTitle:
      draft.originalTitle !== baseline.originalTitle ? draft.originalTitle : undefined,
    sortTitle: draft.sortTitle !== baseline.sortTitle ? draft.sortTitle : undefined,
    year: draft.year !== baseline.year ? draft.year : undefined,
    overview: draft.overview !== baseline.overview ? draft.overview : undefined,
    communityRating:
      draft.communityRating !== baseline.communityRating ? draft.communityRating : undefined,
    genres:
      JSON.stringify(draft.genres) !== JSON.stringify(baseline.genres)
        ? draft.genres
        : undefined,
    directors:
      JSON.stringify(draft.directors) !== JSON.stringify(baseline.directors)
        ? draft.directors
        : undefined,
    actors: !actorsEqual(draft.actors, baseline.actors) ? draft.actors : undefined,
    studios:
      JSON.stringify(draft.studios) !== JSON.stringify(baseline.studios)
        ? draft.studios
        : undefined,
    premiered: draft.premiered !== baseline.premiered ? draft.premiered : undefined,
  };
}

export function countDirtyFields(detail: ManageMediaItemDetailRecord, form: MetadataFormState) {
  const current = buildFormState(detail);
  const keys = Object.keys(current) as Array<keyof MetadataFormState>;
  return keys.reduce((total, key) => total + (current[key] !== form[key] ? 1 : 0), 0);
}

export function parseSubtitleSortOrder(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return 0;
  }
  return Number.parseInt(trimmed, 10);
}

export function buildEmptyMetadataRecord(): ManageMediaItemMetadataRecord {
  return {
    genres: [],
    directors: [],
    actors: [],
    studios: [],
    externalIds: [],
  };
}
