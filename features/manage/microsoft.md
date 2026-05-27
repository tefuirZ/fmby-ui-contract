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
| Token 辅助授权 | start/complete 后枚举 drives/sites，再导入账号 |
| Drive/Site 选择 | 支持 OneDrive 与 SharePoint，不要混淆 drive_id 与 site_id |

## 状态

- 配置缺失：给出配置引导，不隐藏 Microsoft provider。
- 授权过期：允许 recover / 重新授权。
- token 只留在内存，不写浏览器存储。
