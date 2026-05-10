# Design · Layout

## 断点

| 名 | 起始宽度 | 典型设备 |
|----|---------|---------|
| xs | 0 | 移动竖屏 |
| sm | 414px | 大屏手机 |
| md | 768px | 平板竖屏 |
| lg | 1024px | 平板横屏 / 小笔记本 |
| xl | 1280px | 桌面 |
| 2xl | 1536px | 大屏 |

## 栅格

12 列，gutter = `--space-4`，container max-width 在 xl 起为 1280px。

## 顶层 IA

```
┌─────────────────────────────────────────┐
│ Topbar: logo / 搜索 / 通知 / 头像菜单      │
├──────┬──────────────────────────────────┤
│ Side │ Content                           │
│ Nav  │                                   │
│      │                                   │
└──────┴──────────────────────────────────┘
```

- **Topbar**：固定，搜索在中部
- **Sidenav**：lg+ 常驻，md 抽屉，sm 隐藏
- **Content**：padding 用 `--space-6` 起

## 管理面 IA

```
/manage/
├─ overview          顶层
├─ media/            一级分组（资源 / 库 / 源 / 探针 / 命名）
├─ site/users/       一级分组（账户 / 角色 / 注册码）
├─ site/security/    一级分组（会话 / 审计 / 运行）
├─ site/settings     站点设置
├─ site/advanced     高级
└─ tools/            工具（imghost 等）
```

- 分组用 `<details>` 或自实现折叠
- 当前路径高亮 + 父分组自动展开

## 响应式策略

- xs / sm：所有页改单列
- 表格在 sm 以下转卡片视图
- 抽屉默认全屏在 sm，半屏在 md+
