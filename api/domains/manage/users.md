# Manage · Users & Roles

用户、角色模板、批量管控。

## 端点

| Method | Path | 说明 |
|--------|------|------|
| GET    | `/api/manage/users` | 列表，支持 `?page&page_size&search&status&account_kind` |
| POST   | `/api/manage/users` | 创建用户（直接落库，绕过注册码） |
| GET    | `/api/manage/users/{userId}` | 详情（含角色模板、上次登录、设备列表） |
| PATCH  | `/api/manage/users/{userId}` | 局部更新用户 |
| PUT    | `/api/manage/users/{userId}` | 全量更新用户 |
| DELETE | `/api/manage/users/{userId}` | 软删除 / 停用用户 |
| PATCH  | `/api/manage/users/{userId}/status` | 启停用户（active / disabled） |
| POST   | `/api/manage/users/{userId}/reset-password` | 管理员提交新密码并可强制下次修改 |
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

## 关键流程

1. **新建用户**：选 role_template → POST /users，管理员在请求里提交初始密码；响应不回显密码。
2. **批量禁用**：典型 UI 是表格多选 → 顶部"批量禁用"按钮；后端单事务，部分失败也整体回滚
3. **删除模板**：需要按站点敏感操作策略提交 `current_password` 或 `session_confirmation`。

## 错误

- `409 conflict`：用户名重复 / 模板被引用
- `422 validation`：密码强度不够 / 非法 email
- `403 forbidden`：操作 superadmin 时只有 superadmin 能改

## 皮肤实现建议

- 状态徽标：active(绿) / disabled(灰) / locked(红)
- 权限位渲染使用 `capabilities`；角色名只做展示
- 批量操作必须二次确认 + 显示影响人数
- 重置密码表单由管理员输入 `new_password`，可选 `force_change`
