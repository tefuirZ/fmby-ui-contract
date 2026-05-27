# Features · Settings · Profile

个人资料 / 改密。

## 路由
- `/settings/profile`

## 数据
- `GET /api/settings/user/profile`
- `PUT /api/settings/user/profile`
- 当前一方契约没有用户自助改密接口；管理员重置密码属于管理端用户域，不属于当前用户 profile 页。

## UI

| 字段 | 说明 |
|------|------|
| 头像 | 上传（multipart） / 文字 fallback |
| 显示名 | 可改 |
| Email | 可改（如启用通知） |
| 当前密码 | 当 `current_password_required=true` 时，保存资料必须带 `current_password` |

## 状态
- 缺当前密码 → 行内错误，并保留用户已输入的资料字段。
- 保存成功 → 失效 `session` / `settings.user.profile` 相关查询，重新读取显示名等会话展示信息。

## 皮肤建议
- 头像字段当前是 `avatar_url`，不是上传端点；如 skin 提供自有上传，需要先把图片落到可公开读取的 URL。
- profile 页不要调用旧版 me 系列端点；这些不是当前合同端点。
