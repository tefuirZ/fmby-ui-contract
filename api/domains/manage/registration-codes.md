# Manage · Registration Codes

注册码 / 批次管理，用户注册时填这个码（详见 [auth.md](../../auth.md)）。

## 端点

| Method | Path | 说明 |
|--------|------|------|
| GET    | `/api/manage/registration-codes` | 列表 `?page&page_size&status&batch_id` |
| POST   | `/api/manage/registration-codes` | 创建：可单码或一次创建一批（`batch_size`） |
| PATCH  | `/api/manage/registration-codes/{codeId}` | 改备注 / 有效期 / 默认角色 |
| PATCH  | `/api/manage/registration-codes/{codeId}/status` | 启停（active / revoked） |
| DELETE | `/api/manage/registration-codes/{codeId}` | 删除（已使用的码不可删，409） |
| PATCH  | `/api/manage/registration-codes/batches/{batchId}` | 批量改：续期 / 批量吊销 |

## DTO 概览

`RegistrationCode`：
```jsonc
{
  "id": "uuid",
  "code": "ABCD-1234",
  "batch_id": "uuid?",
  "status": "active|used|revoked|expired",
  "max_uses": 1,
  "used_count": 0,
  "default_role_template_id": "uuid?",
  "expires_at": "2026-12-31T23:59:59+08:00?",
  "note": "string?",
  "created_at": "...",
  "used_by_user_id": "uuid?"
}
```

`CreateReq`：`{ batch_size: u32, max_uses: u32, default_role_template_id?, expires_at?, note? }`  
`BatchPatchReq`：`{ revoke?: bool, expires_at?: string }`

> 权威：`crates/fmby-api/src/manage/dto/registration_codes.rs`。

## 关键流程

1. **批量发码**：管理员一次发 50 张 → POST 返回所有 code 字符串（皮肤需要导出 CSV）
2. **吊销批次**：选定 batch → PATCH /batches/{id} { revoke: true }；已使用的码 `used` 状态不变（不可"撤销注册"）
3. **过期自动**：后端定时任务把过期码改 `expired`，无需前端干预

## 错误

- `409 conflict`：删除已使用码 / code 字符串重复
- `422 validation`：`batch_size` 超过上限（默认 200）

## 皮肤实现建议

- 列表必须支持「按状态筛选」+「按 batch 折叠」
- 创建批次后给出"复制全部 / 导出 CSV"两个动作
- 已被使用的码用 `used_by_user_id` 链接到对应用户详情（manage/users）
- 过期临近的码（< 7 天）用 warning 色提示
