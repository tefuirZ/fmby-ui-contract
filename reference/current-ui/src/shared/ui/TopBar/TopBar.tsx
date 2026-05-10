import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Link, useLocation } from 'react-router';
import {
  Home,
  History,
  Library,
  LayoutDashboard,
  User,
  Menu,
  Search,
  X,
} from 'lucide-react';
import { PermissionGate } from '@/shared/permissions/PermissionGate';
import { SearchOverlay } from '@/shared/ui/SearchOverlay/SearchOverlay';
import styles from './TopBar.module.css';

/**
 * 顶部导航栏
 *
 * 功能：
 * - 品牌名 FMBY（链接到首页）
 * - 主导航：放映厅、历史、媒体库
 * - 全局搜索入口（Ctrl+K / Cmd+K）
 * - 管理中心入口（仅管理员可见）
 * - 用户菜单入口
 * - 响应式：平板隐藏文字只保留图标，手机隐藏导航显示汉堡菜单
 */
export function TopBar() {
  const location = useLocation();
  const isManageMode = isPathActive(location.pathname, '/manage');
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleOpenSearch = useCallback(() => setSearchOpen(true), []);
  const handleCloseSearch = useCallback(() => setSearchOpen(false), []);
  const handleOpenMobileNav = useCallback(() => setMobileNavOpen(true), []);
  const handleCloseMobileNav = useCallback(() => setMobileNavOpen(false), []);

  // Ctrl+K / Cmd+K 全局快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className={styles.topbar}>
        <div className={styles.container}>
          {/* 左区：品牌 + 导航 */}
          <div className={styles.left}>
            <Link to="/" className={styles.brand}>
              FMBY
            </Link>

            {/* 手机端汉堡菜单按钮 */}
            <Dialog.Root open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <Dialog.Trigger asChild>
                <button
                  className={styles.menuButton}
                  type="button"
                  aria-label="打开移动导航"
                  aria-expanded={mobileNavOpen}
                  onClick={handleOpenMobileNav}
                >
                  <Menu size={22} aria-hidden="true" />
                </button>
              </Dialog.Trigger>

              <Dialog.Portal>
                <Dialog.Overlay
                  className={styles.mobileNavOverlay}
                  onClick={handleCloseMobileNav}
                />
                <Dialog.Content className={styles.mobileNavSheet}>
                  <div className={styles.mobileNavHeader}>
                    <div className={styles.mobileNavTitleBlock}>
                      <span className={styles.mobileNavEyebrow}>FMBY 导航</span>
                      <Dialog.Title className={styles.mobileNavTitle}>
                        去往哪里？
                      </Dialog.Title>
                      <Dialog.Description className={styles.mobileNavDescription}>
                        选择页面后会自动关闭菜单。
                      </Dialog.Description>
                    </div>

                    <Dialog.Close asChild>
                      <button
                        className={styles.mobileNavCloseButton}
                        type="button"
                        aria-label="关闭移动导航"
                        onClick={handleCloseMobileNav}
                      >
                        <X size={18} aria-hidden="true" />
                      </button>
                    </Dialog.Close>
                  </div>

                  <nav className={styles.mobileNavList} aria-label="移动端主导航">
                    <MobileNavLink
                      to="/"
                      icon={<Home size={19} aria-hidden="true" />}
                      label="放映厅"
                      pathname={location.pathname}
                      onNavigate={handleCloseMobileNav}
                      exact
                    />
                    <MobileNavLink
                      to="/history"
                      icon={<History size={19} aria-hidden="true" />}
                      label="播放历史"
                      pathname={location.pathname}
                      onNavigate={handleCloseMobileNav}
                    />
                    <MobileNavLink
                      to="/libraries"
                      icon={<Library size={19} aria-hidden="true" />}
                      label="媒体库"
                      pathname={location.pathname}
                      onNavigate={handleCloseMobileNav}
                    />
                    <MobileNavLink
                      to="/settings"
                      icon={<User size={19} aria-hidden="true" />}
                      label="用户设置"
                      pathname={location.pathname}
                      onNavigate={handleCloseMobileNav}
                    />
                    <PermissionGate required="manage:access">
                      <MobileNavLink
                        to="/manage"
                        icon={<LayoutDashboard size={19} aria-hidden="true" />}
                        label="管理中心"
                        pathname={location.pathname}
                        onNavigate={handleCloseMobileNav}
                        variant="manage"
                      />
                    </PermissionGate>
                  </nav>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>

            {/* 桌面/平板导航 */}
            <nav className={styles.nav}>
              <NavLink to="/" icon={<Home size={18} />} label="放映厅" exact />
              <NavLink
                to="/history"
                icon={<History size={18} />}
                label="播放历史"
              />
              <NavLink
                to="/libraries"
                icon={<Library size={18} />}
                label="媒体库"
              />
            </nav>
          </div>

          {/* 右区：搜索 + 管理入口 + 用户菜单 */}
          <div className={styles.right}>
            <button
              className={styles.searchButton}
              type="button"
              onClick={handleOpenSearch}
              aria-label="搜索"
            >
              <Search size={18} />
              <span className={styles.searchLabel}>搜索</span>
              <kbd className={styles.searchKbd}>⌘K</kbd>
            </button>

            <PermissionGate required="manage:access">
              <Link
                to="/manage"
                className={`${styles.manageEntry} ${isManageMode ? styles.active : ''}`}
                aria-current={isManageMode ? 'page' : undefined}
              >
                <LayoutDashboard size={18} />
                <span className={styles.manageLabel}>管理中心</span>
              </Link>
            </PermissionGate>

            <Link to="/settings" className={styles.userMenu} aria-label="用户设置">
              <User size={20} />
            </Link>
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={handleCloseSearch} />
    </>
  );
}

/** 导航链接子组件 */
function NavLink({
  to,
  icon,
  label,
  exact = false,
}: {
  to: string;
  icon: ReactNode;
  label: string;
  exact?: boolean;
}) {
  const location = useLocation();
  const isActive = isPathActive(location.pathname, to, exact);

  return (
    <Link
      to={to}
      className={`${styles.navLink} ${isActive ? styles.active : ''}`}
      aria-current={isActive ? 'page' : undefined}
    >
      {icon}
      <span className={styles.navLabel}>{label}</span>
    </Link>
  );
}

function MobileNavLink({
  to,
  icon,
  label,
  pathname,
  onNavigate,
  exact = false,
  variant = 'default',
}: {
  to: string;
  icon: ReactNode;
  label: string;
  pathname: string;
  onNavigate: () => void;
  exact?: boolean;
  variant?: 'default' | 'manage';
}) {
  const isActive = isPathActive(pathname, to, exact);
  const variantClass = variant === 'manage' ? styles.mobileManageLink : '';

  return (
    <Link
      to={to}
      className={`${styles.mobileNavLink} ${variantClass} ${isActive ? styles.active : ''}`}
      onClick={onNavigate}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className={styles.mobileNavIcon}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

function isPathActive(pathname: string, to: string, exact = false) {
  if (exact) {
    return pathname === to;
  }

  return pathname === to || pathname.startsWith(`${to}/`);
}
