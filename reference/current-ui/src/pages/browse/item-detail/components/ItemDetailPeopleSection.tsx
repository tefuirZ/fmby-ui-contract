import type { ItemDetailResponse } from '@/domains/item';
import { HoverScrollArea } from '@/shared/ui/common/HoverScrollArea';
import styles from '../../BrowsePages.module.css';
import { PersonCard } from './PersonCard';

interface ItemDetailPeopleSectionProps {
  item: ItemDetailResponse;
}

export function ItemDetailPeopleSection({ item }: ItemDetailPeopleSectionProps) {
  return (
    <section className={styles.detailInfoCard}>
      <h2 className={styles.sectionTitle}>演员与主创</h2>
      <div className={styles.peopleSectionBody}>
        {item.directorPeople.length > 0 ? (
          <div>
            <h3 className={styles.detailSubsectionTitle}>导演</h3>
            <HoverScrollArea axis="x" delayMs={0} className={styles.peopleRail}>
              {item.directorPeople.map((person, index) => (
                <PersonCard key={person.id ?? `director-${person.name}-${index}`} person={person} />
              ))}
            </HoverScrollArea>
          </div>
        ) : null}
        {item.actors.length > 0 ? (
          <div>
            <h3 className={styles.detailSubsectionTitle}>演员</h3>
            <HoverScrollArea axis="x" delayMs={0} className={styles.peopleRail}>
              {item.actors.map((person, index) => (
                <PersonCard key={person.id ?? `actor-${person.name}-${index}`} person={person} />
              ))}
            </HoverScrollArea>
          </div>
        ) : null}
      </div>
    </section>
  );
}
