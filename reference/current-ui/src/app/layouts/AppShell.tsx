import { Outlet, useLocation } from 'react-router';
import { TopBar } from '@/shared/ui/TopBar/TopBar';
import styles from './AppShell.module.css';

/**
 * 应用壳组件
 *
 * 统一包裹所有需要鉴权的页面，提供：
 * - TopBar 顶部导航栏（品牌名 + 主导航 + 管理入口 + 用户菜单）
 * - 全局通知区域（待实现）
 */
export function AppShell() {
  const location = useLocation();
  const hideTopBar = location.pathname.startsWith('/play/');

  return (
    <div className={styles.shell}>
      {hideTopBar ? null : <TopBar />}
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
