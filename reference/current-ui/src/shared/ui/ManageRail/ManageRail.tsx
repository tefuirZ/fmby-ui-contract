import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import styles from './ManageRail.module.css';
import {
  getManageActiveBranchIds,
  isManageNavNodeActive,
  manageNavTree,
  type ManageNavNode,
} from './navigation';

interface ManageRailProps {
  mode?: 'desktop' | 'mobile';
}

function createExpandedState(pathname: string) {
  const activeBranchIds = getManageActiveBranchIds(pathname);
  return {
    media: true,
    site: true,
    ...Object.fromEntries(Array.from(activeBranchIds).map((id) => [id, true])),
  };
}

export function ManageRail({ mode = 'desktop' }: ManageRailProps) {
  const location = useLocation();
  const [expandedState, setExpandedState] = useState<Record<string, boolean>>(
    () => createExpandedState(location.pathname),
  );

  useEffect(() => {
    const activeBranchIds = getManageActiveBranchIds(location.pathname);
    if (activeBranchIds.size === 0) {
      return;
    }

    setExpandedState((current) => {
      const nextState = { ...current };
      let changed = false;

      for (const id of activeBranchIds) {
        if (!nextState[id]) {
          nextState[id] = true;
          changed = true;
        }
      }

      return changed ? nextState : current;
    });
  }, [location.pathname]);

  function toggleBranch(id: string) {
    setExpandedState((current) => ({
      ...current,
      [id]: !current[id],
    }));
  }

  function renderNodes(nodes: ManageNavNode[], level = 0) {
    return nodes.map((node) => {
      const Icon = node.icon;
      const isActive = isManageNavNodeActive(location.pathname, node);
      const indent = level * 18 + 14;

      if (node.children && node.children.length > 0) {
        const expanded = expandedState[node.id] ?? isActive;

        return (
          <div key={node.id} className={styles.branch}>
            <button
              className={`${styles.branchToggle} ${
                isActive ? styles.branchToggleActive : ''
              }`}
              type="button"
              aria-expanded={expanded}
              style={{ paddingLeft: `${indent}px` }}
              onClick={() => toggleBranch(node.id)}
            >
              <span className={styles.itemLead}>
                {Icon ? <Icon size={18} className={styles.navIcon} /> : null}
                <span className={styles.navLabel}>{node.label}</span>
              </span>
              <ChevronDown
                size={16}
                className={`${styles.chevron} ${
                  expanded ? styles.chevronExpanded : ''
                }`}
              />
            </button>

            {expanded ? (
              <div className={styles.branchChildren}>
                {renderNodes(node.children, level + 1)}
              </div>
            ) : null}
          </div>
        );
      }

      return (
        <Link
          key={node.id}
          to={node.to ?? '/manage'}
          className={`${styles.navItem} ${isActive ? styles.active : ''}`}
          style={{ paddingLeft: `${indent}px` }}
        >
          <span className={styles.itemLead}>
            {Icon ? <Icon size={18} className={styles.navIcon} /> : null}
            <span className={styles.navLabel}>{node.label}</span>
          </span>
        </Link>
      );
    });
  }

  return (
    <aside
      className={`${styles.rail} ${
        mode === 'mobile' ? styles.railMobile : styles.railDesktop
      }`}
    >
      <div className={styles.railHeader}>
        <span className={styles.railEyebrow}>管理导航</span>
        <strong className={styles.railTitle}>
          {mode === 'mobile' ? '站点入口' : '后台工作台'}
        </strong>
      </div>
      <nav className={styles.navTree} aria-label="管理中心导航">
        {renderNodes(manageNavTree)}
      </nav>
    </aside>
  );
}
