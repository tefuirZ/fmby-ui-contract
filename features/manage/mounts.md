# Features · Manage · Mounts

## 路由

- `/manage/media/mounts`

## 数据契约

- [../../api/domains/manage/mounts.md](../../api/domains/manage/mounts.md)
- [../../api/domains/manage/pan115.md](../../api/domains/manage/pan115.md)

## 当前主线 UI 范围

### 列表页

- 名称
- provider 类型
- 健康状态
- 最近状态说明
- 关联媒体库 / 媒体源 / 旁路资源数量
- 不可用绑定数量
- 操作：查看 / 编辑 / 校验 / 刷新访问 / 删除

### 新建 / 编辑抽屉

按 provider 类型动态展示不同区块：

- `local`
  - 基本信息
  - 本机目录浏览器
  - 能力声明
  - 路径策略
- `alist` / `openlist`
  - 服务地址
  - 认证方式（token / 用户名密码）
  - 目录浏览器
  - 远端治理（`request_policy`）
  - 能力声明 / 路径策略
- `microsoft-global` / `microsoft-china`
  - token / refresh token
  - OneDrive / SharePoint 选择
  - 目录浏览器
  - 远端治理（`request_policy`）
  - 能力声明 / 路径策略
- `pan115`
  - 创建态凭据准备 / 详情态账号管理
  - 专用根目录选择器（返回目录 `cid`）
  - 远端治理（`request_policy`）
  - 能力声明 / 路径策略
- `pan115-share`
  - 分享链接 / share_code
  - 提取码
  - 下载通道 `client_type`
  - 目录浏览器（选择分享内子目录根）
  - 远端治理（`request_policy`）
  - 能力声明 / 路径策略

## 目录浏览规则

### 挂载创建 / 编辑

- `local` / `alist` / `openlist` / `microsoft-*` / `pan115-share`：使用通用目录浏览器
- `pan115`：使用专用 115 browse API

### 媒体库绑定页

同样必须支持目录浏览，且语义是“在既有 mount 根内继续选择子目录”。

不能做的事：

- 不允许只让管理员手填远端路径
- 不允许把媒体库绑定浏览错误地放到 provider 全局根
- 不允许把 `pan115` 当成通用目录浏览来源来处理

## 远端治理区块

`RequestPolicySection` 面向以下来源开放：

- `alist`
- `openlist`
- `microsoft-global`
- `microsoft-china`
- `pan115`
- `pan115-share`

字段写入 `config_json.request_policy`，推荐展示：

- `request_timeout_ms`
- `min_request_interval_ms`
- `max_retries`
- `retry_backoff_base_ms`
- `retry_backoff_max_ms`
- `throttle_cooldown_ms`
- `auth_cooldown_ms`
- `browse_concurrency`

## 皮肤实现约束

1. 新主题不得删除目录浏览器，只能重做交互外观。
2. `pan115-share` 必须显式告诉管理员：`root_path` 保存的是分享内子目录，不是分享链接本身。
3. `pan115` 必须显式告诉管理员：`root_path` 保存的是目录 `cid`，不要手填。
4. 删除挂载前必须展示引用影响，不能静默删。
5. 敏感字段不能直接渲染到 DOM；即便后端已脱敏，前端也应避免复制/回显原始密码、token、cookie。
