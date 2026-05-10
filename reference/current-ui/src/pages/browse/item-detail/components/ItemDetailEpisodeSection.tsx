import type { Dispatch, SetStateAction } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import type { ItemDetailResponse } from '@/domains/item';
import type { MediaCardSummary } from '@/domains/browse';
import { HoverScrollArea } from '@/shared/ui/common/HoverScrollArea';
import { InlineBanner } from '@/shared/ui/common/InlineBanner';
import { getErrorMessage } from '@/shared/utils/error';
import styles from '../../BrowsePages.module.css';
import { EpisodeRow } from './EpisodeRow';
import { buildEpisodeSectionSummary } from '../formUtils';

interface ItemDetailEpisodeSectionProps {
  item: ItemDetailResponse;
  seasonOptions: MediaCardSummary[];
  episodeOptions: MediaCardSummary[];
  selectedSeasonId: string | undefined;
  setSelectedSeasonId: Dispatch<SetStateAction<string | undefined>>;
  selectedSeasonQuery: UseQueryResult<ItemDetailResponse | undefined>;
}

export function ItemDetailEpisodeSection({
  item,
  seasonOptions,
  episodeOptions,
  selectedSeasonId,
  setSelectedSeasonId,
  selectedSeasonQuery,
}: ItemDetailEpisodeSectionProps) {
  return (
    <section className={styles.detailInfoCard}>
      <div className={styles.detailSectionHeader}>
        <div className={styles.sectionHeadingStack}>
          <h2 className={styles.sectionTitle}>
            {item.kind === 'series' ? '分季与分集' : '本季分集'}
          </h2>
          <p className={styles.sectionDescription}>
            {buildEpisodeSectionSummary(item, seasonOptions, episodeOptions, selectedSeasonId)}
          </p>
        </div>
        {episodeOptions.length > 0 ? (
          <span className={styles.detailSectionHint}>左右滚动切换分集</span>
        ) : null}
      </div>
      {item.kind === 'series' && seasonOptions.length > 0 ? (
        <HoverScrollArea axis="x" delayMs={0} className={styles.seasonSelector}>
          {seasonOptions.map((season) => (
            <button
              key={season.id}
              className={styles.seasonChip}
              data-selected={selectedSeasonId === season.id}
              type="button"
              onClick={() => setSelectedSeasonId(season.id)}
            >
              <span>{season.title}</span>
              {season.itemCount ? (
                <span className={styles.seasonChipMeta}>{season.itemCount} 集</span>
              ) : null}
            </button>
          ))}
        </HoverScrollArea>
      ) : null}

      {item.kind === 'series' && selectedSeasonQuery.isPending ? (
        <div className={styles.episodeSelectorEmpty}>正在加载当前季度分集...</div>
      ) : null}
      {item.kind === 'series' && selectedSeasonQuery.isError ? (
        <InlineBanner
          variant="error"
          title="当前季度分集加载失败"
          description={getErrorMessage(selectedSeasonQuery.error)}
        />
      ) : null}
      {episodeOptions.length > 0 ? (
        <HoverScrollArea axis="x" delayMs={0} className={styles.episodeList}>
          {episodeOptions.map((episode) => (
            <EpisodeRow key={episode.id} episode={episode} />
          ))}
        </HoverScrollArea>
      ) : (
        !(
          item.kind === 'series' &&
          (selectedSeasonQuery.isPending || selectedSeasonQuery.isError)
        ) ? (
          <div className={styles.episodeSelectorEmpty}>
            还没有识别到可播放分集。
          </div>
        ) : null
      )}
    </section>
  );
}
