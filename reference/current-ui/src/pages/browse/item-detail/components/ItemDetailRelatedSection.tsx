import type { ItemDetailResponse } from '@/domains/item';
import { PosterMediaCard } from '../../components';
import styles from '../../BrowsePages.module.css';

interface ItemDetailRelatedSectionProps {
  item: ItemDetailResponse;
}

export function ItemDetailRelatedSection({ item }: ItemDetailRelatedSectionProps) {
  return (
    <section className={styles.detailRelatedCard}>
      <h2 className={styles.sectionTitle}>相关内容</h2>
      {item.related.length === 0 ? (
        <div className={styles.emptyGrid}>还没有可推荐的相关内容。</div>
      ) : (
        <div className={styles.detailRelatedGrid}>
          {item.related.map((related) => (
            <PosterMediaCard key={related.id} item={related} />
          ))}
        </div>
      )}
    </section>
  );
}
