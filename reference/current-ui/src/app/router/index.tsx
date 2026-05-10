import { Navigate, createBrowserRouter, useLocation, useParams } from 'react-router';
import { AppShell } from '@/app/layouts/AppShell';
import { BrowseLayout } from '@/app/layouts/BrowseLayout';
import { ManageLayout } from '@/app/layouts/ManageLayout';
import { AuthGuard } from '@/app/guards/AuthGuard';
import { CapabilityGuard } from '@/app/guards/CapabilityGuard';
import {
  SettingsLayout,
} from '@/pages/settings';
import { PAN115_IMGHOST_ENABLED } from '@/shared/featureFlags';
import { RouteErrorPage } from './RouteErrorPage';

function LegacyAdminRedirect() {
  const location = useLocation();
  const suffix = location.pathname.replace(/^\/admin/, '');
  return <Navigate replace to={`/manage${suffix}${location.search}`} />;
}

function ManageLegacyRedirect({ to }: { to: string }) {
  const location = useLocation();
  return <Navigate replace to={`${to}${location.search}`} />;
}

function LegacyManageMediaItemRedirect() {
  const location = useLocation();
  const { itemId } = useParams();
  return (
    <Navigate
      replace
      to={`/manage/media/items/${itemId ?? ''}${location.search}`}
    />
  );
}

function RouteHydrateFallback() {
  return <div style={{ minHeight: '100vh', background: '#090b10' }} />;
}

/**
 * 应用路由配置
 *
 * 路由结构：
 * - /login                    登录页（无需鉴权，独立布局）
 * - /                         首页（需要鉴权，使用 BrowseLayout）
 * - /history                  播放历史
 * - /libraries                媒体库列表
 * - /libraries/:id            媒体库详情
 * - /item/:itemId             媒体项详情
 * - /play/:itemId             播放页
 * - /settings/*               设置页
 * - /manage                               管理首页（使用 ManageLayout）
 * - /manage/media/items                   媒体资源
 * - /manage/media/add                     添加媒体
 * - /manage/media/libraries               媒体库管理
 * - /manage/media/mounts                  数据来源管理
 * - /manage/media/probe-tasks             技术探测任务
 * - /manage/media/naming-scrape           命名刮削设置
 * - /manage/site/users/registration-codes 注册码管理
 * - /manage/site/users/accounts           用户管理
 * - /manage/site/users/role-templates     模板管理
 * - /manage/site/security/sessions        会话管理
 * - /manage/site/security/audit-logs      操作日志
 * - /manage/site/security/runtime-logs    运行日志
 * - /manage/site/settings                 站点设置
 * - /manage/site/advanced                 高级设置
 * - /manage/tools/pan115-imghost          图床工具（VITE_FEATURE_PAN115_IMGHOST=1 时启用）
 */
export const router = createBrowserRouter([
  {
    path: '/login',
    errorElement: <RouteErrorPage />,
    hydrateFallbackElement: <RouteHydrateFallback />,
    lazy: async () => {
      const { LoginPage } = await import('@/pages/login');
      return { Component: LoginPage };
    },
  },
  {
    // 需要鉴权的路由统一包裹 AuthGuard + AppShell
    errorElement: <RouteErrorPage />,
    hydrateFallbackElement: <RouteHydrateFallback />,
    element: (
      <AuthGuard>
        <AppShell />
      </AuthGuard>
    ),
    children: [
      {
        // 浏览类页面使用 BrowseLayout
        element: <BrowseLayout />,
        children: [
          {
            index: true,
            lazy: async () => {
              const { HomePage } = await import('@/pages/browse');
              return { Component: HomePage };
            },
          },
          {
            path: 'history',
            lazy: async () => {
              const { HistoryPage } = await import('@/pages/browse');
              return { Component: HistoryPage };
            },
          },
          {
            path: 'libraries',
            lazy: async () => {
              const { LibrariesPage } = await import('@/pages/browse');
              return { Component: LibrariesPage };
            },
          },
          {
            path: 'libraries/:libraryId',
            lazy: async () => {
              const { LibraryDetailPage } = await import('@/pages/browse');
              return { Component: LibraryDetailPage };
            },
          },
          {
            path: 'item/:itemId',
            lazy: async () => {
              const { ItemDetailPage } = await import('@/pages/browse');
              return { Component: ItemDetailPage };
            },
          },
          {
            path: 'settings',
            element: <SettingsLayout />,
            children: [
              {
                index: true,
                element: <Navigate replace to="profile" />,
              },
              {
                path: 'profile',
                lazy: async () => {
                  const { ProfileSettingsPage } = await import('@/pages/settings');
                  return { Component: ProfileSettingsPage };
                },
              },
              {
                path: 'playback',
                lazy: async () => {
                  const { PlaybackSettingsPage } = await import('@/pages/settings');
                  return { Component: PlaybackSettingsPage };
                },
              },
              {
                path: 'appearance',
                lazy: async () => {
                  const { AppearanceSettingsPage } = await import('@/pages/settings');
                  return { Component: AppearanceSettingsPage };
                },
              },
              {
                path: 'server/general',
                lazy: async () => {
                  const { ServerGeneralSettingsPage } = await import('@/pages/settings');
                  return {
                    Component: () => (
                      <CapabilityGuard required="manage:access">
                        <ServerGeneralSettingsPage />
                      </CapabilityGuard>
                    ),
                  };
                },
              },
              {
                path: 'server/security',
                lazy: async () => {
                  const { ServerSecuritySettingsPage } = await import('@/pages/settings');
                  return {
                    Component: () => (
                      <CapabilityGuard required="manage:access">
                        <ServerSecuritySettingsPage />
                      </CapabilityGuard>
                    ),
                  };
                },
              },
              {
                path: 'server/session-policy',
                lazy: async () => {
                  const { ServerSessionPolicySettingsPage } = await import('@/pages/settings');
                  return {
                    Component: () => (
                      <CapabilityGuard required="manage:access">
                        <ServerSessionPolicySettingsPage />
                      </CapabilityGuard>
                    ),
                  };
                },
              },
            ],
          },
        ],
      },
      {
        // 播放页独立布局（全屏）
        path: 'play/:itemId',
        lazy: async () => {
          const { PlayPage } = await import('@/pages/browse');
          return { Component: PlayPage };
        },
      },
      {
        // 管理页面使用独立布局
        path: 'manage',
        element: (
          <CapabilityGuard required="manage:access">
            <ManageLayout />
          </CapabilityGuard>
        ),
        children: [
          {
            index: true,
            lazy: async () => {
              const { ManageOverviewPage } = await import('@/pages/manage');
              return { Component: ManageOverviewPage };
            },
          },
          {
            path: 'task-center',
            lazy: async () => {
              const { ManageTaskCenterPage } = await import('@/pages/manage');
              return { Component: ManageTaskCenterPage };
            },
          },
          {
            path: 'media',
            children: [
              {
                index: true,
                element: <Navigate replace to="add" />,
              },
              {
                path: 'add',
                lazy: async () => {
                  const { ManageAddMediaPage } = await import('@/pages/manage');
                  return { Component: ManageAddMediaPage };
                },
              },
              {
                path: 'items',
                lazy: async () => {
                  const { ManageMediaItemsPage } = await import('@/pages/manage');
                  return { Component: ManageMediaItemsPage };
                },
              },
              {
                path: 'items/:itemId',
                lazy: async () => {
                  const { ManageMediaItemDetailPage } = await import('@/pages/manage');
                  return { Component: ManageMediaItemDetailPage };
                },
              },
              {
                path: 'libraries',
                lazy: async () => {
                  const { ManageLibrariesPage } = await import('@/pages/manage');
                  return { Component: ManageLibrariesPage };
                },
              },
              {
                path: 'mounts',
                lazy: async () => {
                  const { ManageMountsPage } = await import('@/pages/manage');
                  return { Component: ManageMountsPage };
                },
              },
              {
                path: 'probe-tasks',
                lazy: async () => {
                  const { ManageProbeTasksPage } = await import('@/pages/manage');
                  return { Component: ManageProbeTasksPage };
                },
              },
              {
                path: 'naming-scrape',
                lazy: async () => {
                  const { ManageNamingRulesPage } = await import('@/pages/manage');
                  return { Component: ManageNamingRulesPage };
                },
              },
              {
                path: 'naming-cleanup',
                element: <Navigate replace to="../naming-scrape" />,
              },
            ],
          },
          {
            path: 'site',
            children: [
              {
                index: true,
                element: <Navigate replace to="users/accounts" />,
              },
              {
                path: 'users',
                children: [
                  {
                    index: true,
                    element: <Navigate replace to="accounts" />,
                  },
                  {
                    path: 'registration-codes',
                    lazy: async () => {
                      const { ManageRegistrationCodesPage } = await import('@/pages/manage');
                      return { Component: ManageRegistrationCodesPage };
                    },
                  },
                  {
                    path: 'accounts',
                    lazy: async () => {
                      const { ManageUsersPage } = await import('@/pages/manage');
                      return { Component: ManageUsersPage };
                    },
                  },
                  {
                    path: 'role-templates',
                    lazy: async () => {
                      const { ManageRoleTemplatesPage } = await import('@/pages/manage');
                      return { Component: ManageRoleTemplatesPage };
                    },
                  },
                ],
              },
              {
                path: 'security',
                children: [
                  {
                    index: true,
                    element: <Navigate replace to="sessions" />,
                  },
                  {
                    path: 'sessions',
                    lazy: async () => {
                      const { ManageSessionsPage } = await import('@/pages/manage');
                      return { Component: ManageSessionsPage };
                    },
                  },
                  {
                    path: 'audit-logs',
                    lazy: async () => {
                      const { ManageAuditLogsPage } = await import('@/pages/manage');
                      return { Component: ManageAuditLogsPage };
                    },
                  },
                  {
                    path: 'runtime-logs',
                    lazy: async () => {
                      const { ManageRuntimeLogsPage } = await import('@/pages/manage');
                      return { Component: ManageRuntimeLogsPage };
                    },
                  },
                ],
              },
              {
                path: 'config',
                children: [
                  {
                    index: true,
                    element: <Navigate replace to="../settings" />,
                  },
                  {
                    path: 'general',
                    element: <ManageLegacyRedirect to="/manage/site/settings" />,
                  },
                  {
                    path: 'security',
                    element: <ManageLegacyRedirect to="/manage/site/settings" />,
                  },
                  {
                    path: 'session-policy',
                    element: <ManageLegacyRedirect to="/manage/site/settings" />,
                  },
                ],
              },
              {
                path: 'settings',
                lazy: async () => {
                  const { ManageSiteSettingsPage } = await import('@/pages/manage');
                  return { Component: ManageSiteSettingsPage };
                },
              },
              {
                path: 'advanced',
                lazy: async () => {
                  const { ManageAdvancedPage } = await import('@/pages/manage');
                  return { Component: ManageAdvancedPage };
                },
              },
            ],
          },
          // ── 内部工具（Feature Flag 控制，lazy 保证 bundle 隔离）─────────────
          ...(PAN115_IMGHOST_ENABLED
            ? [
                {
                  path: 'tools/pan115-imghost',
                  lazy: async () => {
                    const { Pan115ImghostPage } = await import(
                      '@/pages/manage/pan115-imghost'
                    );
                    return { Component: Pan115ImghostPage };
                  },
                },
              ]
            : []),
          // ── 遗留路径重定向 ────────────────────────────────────────────────────
          {
            path: 'media-items',
            element: <ManageLegacyRedirect to="/manage/media/items" />,
          },
          {
            path: 'media-items/:itemId',
            element: <LegacyManageMediaItemRedirect />,
          },
          {
            path: 'libraries',
            element: <ManageLegacyRedirect to="/manage/media/libraries" />,
          },
          {
            path: 'mounts',
            element: <ManageLegacyRedirect to="/manage/media/mounts" />,
          },
          {
            path: 'probe-tasks',
            element: <ManageLegacyRedirect to="/manage/media/probe-tasks" />,
          },
          {
            path: 'naming-cleanup',
            element: <ManageLegacyRedirect to="/manage/media/naming-scrape" />,
          },
          {
            path: 'registration-codes',
            element: <ManageLegacyRedirect to="/manage/site/users/registration-codes" />,
          },
          {
            path: 'users',
            element: <ManageLegacyRedirect to="/manage/site/users/accounts" />,
          },
          {
            path: 'role-templates',
            element: <ManageLegacyRedirect to="/manage/site/users/role-templates" />,
          },
          {
            path: 'sessions',
            element: <ManageLegacyRedirect to="/manage/site/security/sessions" />,
          },
          {
            path: 'audit-logs',
            element: <ManageLegacyRedirect to="/manage/site/security/audit-logs" />,
          },
          {
            path: 'runtime-logs',
            element: <ManageLegacyRedirect to="/manage/site/security/runtime-logs" />,
          },
          {
            path: 'advanced',
            element: <ManageLegacyRedirect to="/manage/site/advanced" />,
          },
        ],
      },
      {
        path: 'admin/*',
        element: <LegacyAdminRedirect />,
      },
    ],
  },
]);
