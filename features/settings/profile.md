# Features · Settings · Profile

个人资料 / 改密。

## 路由
- `/settings/profile`

## 数据
- `GET /api/me`、`PATCH /api/me`
- `POST /api/me/change-password`

## UI

| 字段 | 说明 |
|------|------|
| 头像 | 上传（multipart） / 文字 fallback |
| 显示名 | 可改 |
| Email | 可改（如启用通知） |
| 改密 | 旧密 + 新密 + 确认 |

## 状态
- 密码不一致 → 行内错误
- 弱密 → 强度条 + 提示
- 改密成功 → 强制重新登录或保留当前会话（按 server-session-policy）

## 皮肤建议
- 头像上传 ≤ 2MB，自动裁剪正方形
- 改密后清前端缓存
