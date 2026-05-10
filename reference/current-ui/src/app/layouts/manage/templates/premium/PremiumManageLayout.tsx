import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Menu, X } from 'lucide-react';
import { Outlet, useLocation } from 'react-router';
import {
  getPremiumActiveManageNavNode,
  PremiumManageRail,
} from './PremiumManageRail';
import styles from './premium.module.css';

export function PremiumManageLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const activeModuleLabel =
    getPremiumActiveManageNavNode(location.pathname)?.label ?? '管理首页';

  return (
    <div className={styles.premiumShell} data-manage-template="premium">
      <div className={styles.glowLayer} aria-hidden="true" />
      <PremiumManageRail />
      <div className={styles.workspace}>
        <Dialog.Root open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <div className={styles.mobileCommandBar}>
            <Dialog.Trigger asChild>
              <button
                className={styles.mobileModuleTrigger}
                type="button"
                aria-label={`切换管理模块，当前模块：${activeModuleLabel}`}
              >
                <span className={styles.mobileModuleText}>
                  <span className={styles.mobileModuleEyebrow}>当前模块</span>
                  <strong className={styles.mobileModuleTitle}>
                    {activeModuleLabel}
                  </strong>
                </span>
                <span className={styles.mobileModuleAction}>
                  切换模块
                  <Menu size={17} aria-hidden="true" />
                </span>
              </button>
            </Dialog.Trigger>
          </div>

          <Dialog.Portal>
            <Dialog.Overlay className={styles.mobileNavOverlay} />
            <Dialog.Content className={styles.mobileNavDrawer}>
              <div className={styles.mobileNavHeader}>
                <div className={styles.mobileNavTitleBlock}>
                  <span className={styles.mobileNavEyebrow}>Premium 导航</span>
                  <Dialog.Title className={styles.mobileNavTitle}>
                    切换管理模块
                  </Dialog.Title>
                  <Dialog.Description className={styles.mobileNavDescription}>
                    当前模块：{activeModuleLabel}。选择目标后将自动关闭导航抽屉。
                  </Dialog.Description>
                </div>
                <Dialog.Close asChild>
                  <button
                    className={styles.mobileNavCloseButton}
                    type="button"
                    aria-label="关闭管理导航"
                  >
                    <X size={18} aria-hidden="true" />
                    <span>关闭</span>
                  </button>
                </Dialog.Close>
              </div>

              <div className={styles.mobileNavBody}>
                <PremiumManageRail
                  mode="mobile"
                  onNavigate={() => setMobileNavOpen(false)}
                />
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        <div className={styles.contentSurface}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
