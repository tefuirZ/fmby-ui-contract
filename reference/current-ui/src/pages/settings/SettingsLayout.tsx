import { Link, Outlet, useLocation } from 'react-router';
import { useSession } from '@/shared/session/SessionProvider';
import styles from './SettingsCenter.module.css';
import { settingsNavGroups } from './settingsNavigation';

export function SettingsLayout() {
  const location = useLocation();
  const { hasCapability } = useSession();

  const visibleGroups = settingsNavGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.requiresManage || hasCapability('manage:access'),
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className={styles.layout}>
      <aside className={styles.nav}>
        {visibleGroups.map((group) => (
          <div className={styles.navGroup} key={group.label}>
            <div className={styles.navLabel}>{group.label}</div>
            {group.items.map((item) => {
              const isActive =
                location.pathname === item.to || location.pathname.startsWith(item.to + '/');

              return (
                <Link
                  key={item.to}
                  className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                  to={item.to}
                >
                  <span>{item.label}</span>
                  <span className={styles.navDescription}>{item.description}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </aside>

      <div className={styles.main}>
        <div className={styles.mobileNav}>
          {visibleGroups.flatMap((group) =>
            group.items.map((item) => {
              const isActive =
                location.pathname === item.to || location.pathname.startsWith(item.to + '/');

              return (
                <Link
                  key={item.to}
                  className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                  to={item.to}
                >
                  <span>{item.label}</span>
                  <span className={styles.navDescription}>{item.description}</span>
                </Link>
              );
            }),
          )}
        </div>
        <Outlet />
      </div>
    </div>
  );
}
