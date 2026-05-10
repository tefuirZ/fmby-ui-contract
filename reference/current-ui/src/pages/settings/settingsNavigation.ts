export interface SettingsNavItem {
  to: string;
  label: string;
  description: string;
  requiresManage?: boolean;
}

export interface SettingsNavGroup {
  label: string;
  items: SettingsNavItem[];
}

export const settingsNavGroups: SettingsNavGroup[] = [
  {
    label: '个人',
    items: [
      {
        to: '/settings/profile',
        label: '个人资料',
        description: '昵称、头像、默认媒体库',
      },
      {
        to: '/settings/playback',
        label: '播放偏好',
        description: '字幕、音轨与继续播放策略',
      },
      {
        to: '/settings/appearance',
        label: '外观',
        description: '主题、海报密度与动效偏好',
      },
    ],
  },
  {
    label: '站点',
    items: [
      {
        to: '/settings/server/general',
        label: '站点常规',
        description: '站点名称、注册开关、公共文案',
        requiresManage: true,
      },
      {
        to: '/settings/server/security',
        label: '安全策略',
        description: '登录保护与敏感操作确认',
        requiresManage: true,
      },
      {
        to: '/settings/server/session-policy',
        label: '会话策略',
        description: '会话 TTL 与令牌策略',
        requiresManage: true,
      },
    ],
  },
];
