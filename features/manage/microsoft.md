# Features · Manage · Microsoft Auth

## 路由

当前没有独立顶层页面，Microsoft 授权流程嵌入：

- `/manage/media/mounts` 创建 / 编辑 Microsoft 类型挂载
- `/manage/media/libraries` 选择 Microsoft 来源时的辅助配置

## 数据

- API：[`../../api/domains/manage/microsoft.md`](../../api/domains/manage/microsoft.md)

## UI 范围

| 区块 | 要求 |
|---|---|
| 配置状态 | 展示 global/china provider 的 client_id、client_secret、redirect_uri、token key 状态 |
| 授权账号列表 | provider、tenant、drive、serviceKind、状态、最近成功 / 错误 |
| OAuth 授权 | start 后打开 authorize_url，complete 时提交 callbackUrl |
| Microsoft 数据源创建向导 | 必须连续完成 provider、服务类型、授权、drive/site、持久账号导入、目录选择和来源创建 |
| Token 辅助授权 | start/complete 后枚举 drives/sites，再导入账号；不得只提供孤立“导入持久账号”按钮 |
| Drive/Site 选择 | 支持 OneDrive 与 SharePoint，不要混淆 drive_id 与 site_id |

## Microsoft 数据源创建向导

`/manage/media/mounts` 创建 Microsoft 类型挂载时必须是连续向导，不允许把管理员丢到一个只导入持久账号的孤立动作里。

1. 选择 provider：`microsoft-global` 或 `microsoft-china`。
2. 选择服务类型：OneDrive 或 SharePoint。
3. 调用 `POST /api/manage/microsoft/auth/token/start`，拿到 `authorize_url`。
4. 页面展示授权地址，并提供打开新窗口和复制授权地址动作。
5. 管理员完成 Microsoft 授权后，粘贴完整 callback URL。
6. 调用 `POST /api/manage/microsoft/auth/token/complete` 换取 access token、refresh token 和 tenant 信息。
7. 将 access token、refresh token、tenant 信息只写入当前页面内存表单态。
8. OneDrive：立即用内存 token 加载 drives。
9. SharePoint：先搜索 site，再加载该 site 下 drives。
10. 管理员选择 drive 后，调用 `/api/manage/microsoft/auth/token/import` 导入持久账号。
11. 导入完成后继续加载目录，选择 root path。
12. 提交 `POST /api/manage/mounts` 创建 `MicrosoftGlobal` 或 `MicrosoftChina` 来源。

## 安全边界

- 授权地址、完整 callback URL、access token、refresh token、tenant 信息和中间授权态只能保存在页面内存态。
- 禁止写入 localStorage、sessionStorage、IndexedDB、URL query、日志、持久表单草稿或跨页缓存。
- 刷新、离开页面或向导关闭后，未导入的临时授权态必须丢弃。
- UI 可以显示授权地址用于打开/复制，但不得长期保留，也不得在错误提示中回显 token。

## 状态

- 配置缺失：给出配置引导，不隐藏 Microsoft provider。
- 授权过期：允许 recover / 重新授权。
- token 只留在内存，不写浏览器存储。
