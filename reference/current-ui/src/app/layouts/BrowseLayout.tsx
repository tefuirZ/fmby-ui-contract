import { Outlet } from 'react-router';
import styles from './BrowseLayout.module.css';

/**
 * 浏览类页面布局
 *
 * 用于首页、媒体库、详情页、历史等浏览型页面。
 * 提供：
 * - 居中内容区域（受 grid-max-width 约束）
 * - 底部迷你播放器（待实现）
 */
export function BrowseLayout() {
  return (
    <div className={styles.browse}>
      <Outlet />
    </div>
  );
}
