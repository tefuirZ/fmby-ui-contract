import { Children, type ReactNode } from 'react';
import { HoverScrollArea } from '@/shared/ui/common/HoverScrollArea';
import styles from '../BrowsePages.module.css';

export function BrowseRail({
  children,
  itemClassName,
}: {
  children: ReactNode;
  itemClassName: string;
}) {
  return (
    <HoverScrollArea className={styles.mediaRail} delayMs={100}>
      {Children.toArray(children).map((child, index) => (
        <div key={index} className={itemClassName}>
          {child}
        </div>
      ))}
    </HoverScrollArea>
  );
}
