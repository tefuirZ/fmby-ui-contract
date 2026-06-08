# Manage · Users & Roles

用户、角色模板、批量管控。

## 端点

| Method | Path | 说明 |
|--------|------|------|
| GET    | `/api/manage/users` | 列表，支持 `?page&pageSize&page_size&search&status&account_kind` |
| POST   | `/api/manage/users` | 创建用户（直接落库，绕过注册码） |
| GET    | `/api/manage/users/{userId}` | 详情（含角色模板、上次登录、设备列表） |
| PATCH  | `/api/manage/users/{userId}` | 局部更新用户 |
| PUT    | `/api/manage/users/{userId}` | 全量更新用户 |
| DELETE | `/api/manage/users/{userId}` | 软删除 / 停用用户 |
| PATCH  | `/api/manage/users/{userId}/status` | 启停用户（active / disabled） |
| POST   | `/api/manage/users/{userId}/reset-password` | 管理员提交新密码并可强制下次修改 |
| POST   | `/api/manage/users/{userId}/login-risk/reset` | 解除该用户当前账号失败锁定风控 |
| POST   | `/api/manage/users/{userId}/mfa/totp/reset` | 重置该用户 TOTP |
| POST   | `/api/manage/users/{userId}/approve-registration` | 通过待审核注册 |
| POST   | `/api/manage/users/{userId}/reject-registration` | 拒绝待审核注册 |
| POST   | `/api/manage/users/batch/disable` | 批量禁用 |
| POST   | `/api/manage/users/batch/update` | 批量更新角色 / 配额 |
| POST   | `/api/manage/users/batch/delete` | 批量删除（默认软删） |
| GET    | `/api/manage/role-templates` | 角色模板列表 |
| POST   | `/api/manage/role-templates` | 新建角色模板 |
| PATCH  | `/api/manage/role-templates/{templateId}` | 改模板（权限位、可见库等） |
| DELETE | `/api/manage/role-templates/{templateId}` | 删模板（被引用时 409） |

## 关键 DTO

`ManagedUserDto`：

```json
{
  "id": "u_001",
  "username": "alice",
  "display_name": "Alice",
  "email": "alice@example.com",
  "status": "active",
  "account_kind": "human",
  "roles": ["User"],
  "source_grants": [],
  "max_sessions": 4,
  "max_concurrent_playbacks": 2,
  "valid_until": null,
  "must_change_password": false,
  "created_at": "2026-05-27T10:00:00Z",
  "updated_at": "2026-05-27T10:00:00Z",
  "last_activity_at": null,
  "recent_client_info": null
}
```

`RoleTemplateDto`：`id / code / name / description / capabilities[] / default_library_ids[] / source_grants[] / default_max_sessions / default_max_concurrent_playbacks / default_valid_days / is_system / status / created_at / updated_at`。

列表响应是通用 `ListResponse<T>`：`{ "items": [...], "total": 123 }`，不包 `{ data }`。

管理端用户列表必须使用后端分页和后端筛选：

- `page` 从 1 开始；`pageSize` / `page_size` 最大 100。
- `search`、`status`、`account_kind` 都由后端参与查询，前端不能只拉第一页后再本地过滤。
- 总数以响应 `total` 为准，不能用 `items.length` 表示全站账号数量。
- 表格批量选择范围限定当前页；切换页码、搜索词、状态或账号类型筛选必须清空选择。

## 关键流程

1. **新建用户**：选 role_template → POST /users，管理员在请求里提交初始密码；响应不回显密码。
2. **批量禁用**：典型 UI 是表格多选 → 顶部"批量禁用"按钮；后端单事务，部分失败也整体回滚
3. **解除账号登录风控**：用户行操作，提交敏感操作确认，后端只写 `auth.login.risk_reset` / `AuthAttempt` marker，不删除失败审计。
4. **删除模板**：需要按站点敏感操作策略提交 `current_password` 或 `session_confirmation`。

### 解除账号登录风控

`POST /api/manage/users/{userId}/login-risk/reset`

请求体沿用 `DangerousActionRequest`：

```json
{
  "confirm_action": "reset-user-login-risk",
  "session_confirmation": "reset-user-login-risk",
  "current_password": null
}
```

响应：

```json
{
  "id": "u_001",
  "result": "success",
  "message": "用户登录风控已解除"
}
```

语义：

- 只解除该用户 normalized username 在当前失败登录窗口内的账号锁定影响。
- 不解除来源 IP 登录限流；IP 解除见 [`login-risk.md`](./login-risk.md)。
- 不删除历史失败登录审计。

### 管理员重置密码

`POST /api/manage/users/{userId}/reset-password`

请求体：

```json
{
  "new_password": "new-secret-123",
  "force_change": false,
  "confirm_action": "reset-user-password",
  "session_confirmation": "reset-user-password",
  "current_password": null
}
```

响应：

```json
{
  "id": "u_001",
  "result": "success",
  "message": "密码已重置"
}
```

语义：

- 管理员显式输入新密码，后端不生成、展示或导出临时密码。
- `force_change` 默认 `false`；管理员勾选后才要求用户下次登录改密。
- 服务账号不可重置 WebUI 交互式登录密码。
- 请求必须按站点敏感操作策略提交 `reset-user-password` 确认。
- 审计 action 为 `manage.user.reset_password`，审计记录不得包含旧密码或新密码明文。

## 错误

- `409 conflict`：用户名重复 / 模板被引用
- `422 validation`：密码强度不够 / 非法 email
- `403 forbidden`：缺少 Admin 身份、目标 capability、敏感操作确认或后端 entitlement

## 皮肤实现建议

- 状态徽标：active(绿) / disabled(灰) / locked(红)
- 权限位渲染使用 `capabilities`；角色名只做展示
- 批量操作必须二次确认 + 显示影响人数
- 重置密码表单由管理员输入 `new_password`，可选 `force_change`，默认不强制下次改密；不展示旧密码、新密码或临时密码。
- 解除登录风控必须用敏感操作确认，行内文案要说明只解除账号失败锁定，不解除 IP 限流。
- Admin 账号保护由后端 capability guard 与敏感操作确认决定；前端不得用历史角色名硬编码谁能修改谁。
