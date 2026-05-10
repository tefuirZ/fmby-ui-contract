import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  FileText,
  Film,
  HardDrive,
  ImageUp,
  KeyRound,
  LayoutDashboard,
  Library,
  Monitor,
  ScrollText,
  Search,
  Settings,
  Shield,
  SlidersHorizontal,
  Users,
} from 'lucide-react';
import { PAN115_IMGHOST_ENABLED } from '@/shared/featureFlags';

export interface ManageNavNode {
  id: string;
  label: string;
  icon?: LucideIcon;
  to?: string;
  exact?: boolean;
  children?: ManageNavNode[];
}

const toolsNodes: ManageNavNode[] = [
  ...(PAN115_IMGHOST_ENABLED
    ? [
        {
          id: 'pan115-imghost',
          label: '图床（115）',
          icon: ImageUp,
          to: '/manage/tools/pan115-imghost',
        } satisfies ManageNavNode,
      ]
    : []),
];

export const manageNavTree: ManageNavNode[] = [
  {
    id: 'overview',
    label: '管理首页',
    icon: LayoutDashboard,
    to: '/manage',
    exact: true,
  },
  {
    id: 'add-media',
    label: '添加媒体',
    icon: HardDrive,
    to: '/manage/media/add',
  },
  {
    id: 'task-center',
    label: '任务中心',
    icon: Activity,
    to: '/manage/task-center',
  },
  {
    id: 'media',
    label: '媒体与刮削',
    icon: Film,
    children: [
      {
        id: 'media-items',
        label: '媒体条目',
        icon: Film,
        to: '/manage/media/items',
      },
      {
        id: 'media-libraries',
        label: '媒体库',
        icon: Library,
        to: '/manage/media/libraries',
      },
      {
        id: 'media-mounts',
        label: '媒体来源',
        icon: HardDrive,
        to: '/manage/media/mounts',
      },
      {
        id: 'media-probe-tasks',
        label: '媒体信息检测',
        icon: Search,
        to: '/manage/media/probe-tasks',
      },
      {
        id: 'media-naming-scrape',
        label: '命名与刮削',
        icon: SlidersHorizontal,
        to: '/manage/media/naming-scrape',
      },
    ],
  },
  {
    id: 'site',
    label: '用户与站点',
    icon: Settings,
    children: [
      {
        id: 'site-users',
        label: '邀请与用户',
        icon: Users,
        children: [
          {
            id: 'site-registration-codes',
            label: '邀请与注册码',
            icon: KeyRound,
            to: '/manage/site/users/registration-codes',
          },
          {
            id: 'site-accounts',
            label: '用户账号',
            icon: Users,
            to: '/manage/site/users/accounts',
          },
          {
            id: 'site-role-templates',
            label: '权限模板',
            icon: Library,
            to: '/manage/site/users/role-templates',
          },
        ],
      },
      {
        id: 'site-security',
        label: '会话与日志',
        icon: Shield,
        children: [
          {
            id: 'site-sessions',
            label: '当前会话',
            icon: Monitor,
            to: '/manage/site/security/sessions',
          },
          {
            id: 'site-audit-logs',
            label: '操作记录',
            icon: ScrollText,
            to: '/manage/site/security/audit-logs',
          },
          {
            id: 'site-runtime-logs',
            label: '运行日志',
            icon: FileText,
            to: '/manage/site/security/runtime-logs',
          },
        ],
      },
      {
        id: 'site-settings',
        label: '站点设置',
        icon: Settings,
        to: '/manage/site/settings',
      },
      {
        id: 'site-advanced',
        label: '高级维护',
        icon: SlidersHorizontal,
        to: '/manage/site/advanced',
      },
    ],
  },
  // ── 内部工具（Feature Flag 控制）────────────────────────────────────────────
  ...(toolsNodes.length > 0
    ? [
        {
          id: 'tools',
          label: '内部工具',
          icon: SlidersHorizontal,
          children: toolsNodes,
        } satisfies ManageNavNode,
      ]
    : []),
];

export function isManageNavNodeActive(
  pathname: string,
  node: ManageNavNode,
): boolean {
  if (node.to) {
    if (node.exact) {
      return pathname === node.to;
    }

    if (pathname === node.to || pathname.startsWith(`${node.to}/`)) {
      return true;
    }
  }

  return (node.children ?? []).some((child) =>
    isManageNavNodeActive(pathname, child),
  );
}

export function getManageActiveBranchIds(pathname: string) {
  const activeIds = new Set<string>();

  function walk(nodes: ManageNavNode[]): boolean {
    let hasActiveDescendant = false;

    for (const node of nodes) {
      const childActive = node.children ? walk(node.children) : false;
      const nodeActive = Boolean(node.to) && isManageNavNodeActive(pathname, node);

      if (childActive) {
        activeIds.add(node.id);
      }

      if (nodeActive || childActive) {
        hasActiveDescendant = true;
      }
    }

    return hasActiveDescendant;
  }

  walk(manageNavTree);
  return activeIds;
}
