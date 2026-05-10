import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import {
  isManageNavNodeActive,
  manageNavTree,
  type ManageNavNode,
} from '@/shared/ui/ManageRail/navigation';
import styles from './premium.module.css';

interface PremiumManageRailProps {
  mode?: 'desktop' | 'mobile';
  onNavigate?: () => void;
}

function findActiveNode(
  nodes: ManageNavNode[],
  pathname: string,
): ManageNavNode | null {
  for (const node of nodes) {
    if (node.to && isManageNavNodeActive(pathname, node)) {
      return node;
    }

    if (node.children) {
      const child = findActiveNode(node.children, pathname);

      if (child) {
        return child;
      }
    }
  }

  return null;
}

function renderLeafNode(
  node: ManageNavNode,
  pathname: string,
  level: number,
  onNavigate?: () => void,
): ReactNode {
  if (!node.to) {
    return null;
  }

  const Icon = node.icon;
  const isActive = isManageNavNodeActive(pathname, node);

  return (
    <Link
      key={node.id}
      to={node.to}
      className={`${styles.premiumNavLink} ${
        isActive ? styles.premiumNavLinkActive : ''
      }`}
      data-active={isActive ? 'true' : undefined}
      onClick={onNavigate}
      style={{ paddingLeft: `${level * 14 + 12}px` }}
    >
      {Icon ? <Icon size={16} className={styles.premiumNavIcon} /> : null}
      <span>{node.label}</span>
    </Link>
  );
}

function renderBranchNodes(
  nodes: ManageNavNode[],
  pathname: string,
  level = 0,
  onNavigate?: () => void,
): ReactNode {
  return nodes.map((node) => {
    if (node.children && node.children.length > 0) {
      const Icon = node.icon;
      const isActive = isManageNavNodeActive(pathname, node);

      return (
        <div
          key={node.id}
          className={styles.premiumSubGroup}
          data-active={isActive ? 'true' : undefined}
        >
          <div className={styles.premiumSubGroupTitle}>
            {Icon ? <Icon size={15} className={styles.premiumNavIcon} /> : null}
            <span>{node.label}</span>
          </div>
          <div className={styles.premiumSubGroupBody}>
            {renderBranchNodes(node.children, pathname, level + 1, onNavigate)}
          </div>
        </div>
      );
    }

    return renderLeafNode(node, pathname, level, onNavigate);
  });
}

export function getPremiumActiveManageNavNode(
  pathname: string,
): ManageNavNode | null {
  return findActiveNode(manageNavTree, pathname);
}

export function PremiumManageRail({
  mode = 'desktop',
  onNavigate,
}: PremiumManageRailProps) {
  const location = useLocation();
  const activeNode = getPremiumActiveManageNavNode(location.pathname);
  const overviewNode = manageNavTree.find((node) => node.id === 'overview');
  const branchNodes = manageNavTree.filter((node) => node.id !== 'overview');

  return (
    <aside
      className={`${styles.premiumRail} ${
        mode === 'mobile' ? styles.premiumRailMobile : styles.premiumRailDesktop
      }`}
      aria-label="Premium 管理中心导航"
    >
      <div className={styles.premiumRailHero}>
        <span className={styles.premiumRailEyebrow}>FMBY Admin</span>
        <strong className={styles.premiumRailTitle}>管理工作台</strong>
        <span className={styles.premiumRailHint}>
          当前模块：{activeNode?.label ?? '管理首页'}
        </span>
      </div>

      <nav className={styles.premiumNavTree} aria-label="管理中心导航">
        {overviewNode ? (
          <div className={styles.premiumOverviewCard}>
            {renderLeafNode(overviewNode, location.pathname, 0, onNavigate)}
          </div>
        ) : null}

        {branchNodes.map((node) => {
          const Icon = node.icon;
          const isActive = isManageNavNodeActive(location.pathname, node);

          return (
            <section
              key={node.id}
              className={styles.premiumNavCard}
              data-active={isActive ? 'true' : undefined}
            >
              <div className={styles.premiumNavCardHeader}>
                <span className={styles.premiumNavCardIcon}>
                  {Icon ? <Icon size={17} /> : null}
                </span>
                <span>{node.label}</span>
              </div>
              <div className={styles.premiumNavCardBody}>
                {node.children
                  ? renderBranchNodes(
                      node.children,
                      location.pathname,
                      0,
                      onNavigate,
                    )
                  : renderLeafNode(node, location.pathname, 0, onNavigate)}
              </div>
            </section>
          );
        })}
      </nav>
    </aside>
  );
}
