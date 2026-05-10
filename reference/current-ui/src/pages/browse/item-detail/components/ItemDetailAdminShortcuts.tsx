import { Link } from 'react-router';
import type { ItemDetailResponse } from '@/domains/item';
import styles from '../../BrowsePages.module.css';

interface ItemDetailAdminShortcutsProps {
  item: ItemDetailResponse;
}

export function ItemDetailAdminShortcuts({ item }: ItemDetailAdminShortcutsProps) {
  if (item.adminShortcuts.length === 0) {
    return null;
  }

  return (
    <section className={styles.detailInfoCard}>
      <h2 className={styles.sectionTitle}>管理员快捷入口</h2>
      <div className={styles.detailShortcuts}>
        {item.adminShortcuts.map((shortcut) => (
          <Link key={`${shortcut.label}-${shortcut.to}`} className={styles.secondaryButton} to={shortcut.to}>
            {shortcut.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
