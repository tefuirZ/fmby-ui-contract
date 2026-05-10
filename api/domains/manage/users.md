# Manage · Users & Roles

用户、角色模板、批量管控。

## 端点

| Method | Path | 说明 |
|--------|------|------|
| GET    | `/api/manage/users` | 列表，支持 `?page&page_size&q&status&role` |
| POST   | `/api/manage/users` | 创建用户（直接落库，绕过注册码） |
| GET    | `/api/manage/users/{userId}` | 详情（含角色模板、上次登录、设备列表） |
| PATCH  | `/api/manage/users/{userId}/status` | 启停用户（active / disabled） |
| POST   | `/api/manage/users/{userId}/reset-password` | 重置密码（生成临时密码或发邮件，看 SiteSettings） |
| POST   | `/api/manage/users/batch/disable` | 批量禁用 |
| POST   | `/api/manage/users/batch/update` | 批量更新角色 / 配额 |
| POST   | `/api/manage/users/batch/delete` | 批量删除（默认软删） |
| GET    | `/api/manage/role-templates` | 角色模板列表 |
| POST   | `/api/manage/role-templates` | 新建角色模板 |
| PATCH  | `/api/manage/role-templates/{templateId}` | 改模板（权限位、可见库等） |
| DELETE | `/api/manage/role-templates/{templateId}` | 删模板（被引用时 409） |

## 关键 DTO

`UserListItem`：`id / username / display_name / status / roles[] / last_login_at / created_at`  
`UserDetail`：在 list 基础上 + `email / role_template_id / library_grants[] / device_sessions[] / quota_bytes`  
`RoleTemplate`：`id / name / permissions[]`，permissions 见 [auth.md 权限矩阵](../../auth.md#权限位)  
`BatchUpdateReq`：`{ user_ids: [...], patch: { role_template_id?, status?, library_grants? } }`

> 字段权威：`crates/fmby-api/src/manage/dto/users.rs`、`role_templates.rs`。

## 关键流程

1. **新建用户**：选 role_template → POST /users，response 返回临时密码（一次性）；皮肤需提示管理员立即转告
2. **批量禁用**：典型 UI 是表格多选 → 顶部"批量禁用"按钮；后端单事务，部分失败也整体回滚
3. **删除模板**：模板被引用时返回 `409 conflict { used_by_user_count: N }`，皮肤需先引导改派

## 错误

- `409 conflict`：用户名重复 / 模板被引用
- `422 validation`：密码强度不够 / 非法 email
- `403 forbidden`：操作 superadmin 时只有 superadmin 能改

## 皮肤实现建议

- 状态徽标：active(绿) / disabled(灰) / locked(红)
- 权限位渲染：`auth.md` 文档化的位 → checkbox 矩阵
- 批量操作必须二次确认 + 显示影响人数
- 重置密码后必须用 modal + "复制临时密码"按钮（HTTPS 才支持 navigator.clipboard，HTTP 走 fallback）
