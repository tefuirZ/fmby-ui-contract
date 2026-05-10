import { FolderOpen } from 'lucide-react';
import { Link } from 'react-router';
import { formatRelativeTime } from '@/shared/utils/date';
import type { LibrarySummary } from '@/domains/browse';
import type { ArtworkSet } from '@/domains/assets';
import { buildSafeBackgroundStyle } from './utils';
import styles from '../BrowsePages.module.css';

function pickWideArtworkUrl(artwork: ArtworkSet): string | null {
  return artwork.bannerUrl ?? artwork.backdropUrl ?? artwork.thumbUrl ?? null;
}

export function LibraryShowcaseCard({ library }: { library: LibrarySummary }) {
  const image = pickWideArtworkUrl(library.artwork);
  return (
    <Link className={styles.libraryCard} to={`/libraries/${library.id}`}>
      <div
        className={styles.libraryBackdrop}
        style={
          image
            ? buildSafeBackgroundStyle(image, 'linear-gradient(180deg, rgba(9, 12, 20, 0.18), rgba(9, 12, 20, 0.9))')
            : undefined
        }
      />
      <div className={styles.libraryBody}>
        <div className={styles.cardMetaRow}>
          <span className={styles.microChip}>
            <FolderOpen size={12} />
            {library.typeLabel}
          </span>
          {library.accentLabel ? <span className={styles.metaText}>{library.accentLabel}</span> : null}
        </div>
        <h3 className={styles.cardTitle}>{library.name}</h3>
        {library.description ? <p className={styles.cardDescription}>{library.description}</p> : null}
        <div className={styles.libraryStats}>
          <span>{library.itemCount.toLocaleString('zh-CN')} 个内容</span>
          <span>{formatRelativeTime(library.updatedAt)}</span>
        </div>
      </div>
    </Link>
  );
}
