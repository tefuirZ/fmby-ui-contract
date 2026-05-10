# Features · Settings · Server Security

站点安全设置（admin）。

## 路由
- `/manage/site/settings` 中的"安全"分组

## 数据
- `PUT /api/site/settings` 子集

## 字段

| 字段 | 说明 |
|------|------|
| allow_registration | 是否开放注册（注册码模式仍需 code） |
| password_min_length | 最小密码长度 |
| password_require_special | 是否要求特殊字符 |
| password_require_number | 是否要求数字 |
| failed_login_lockout | 连续失败锁定阈值 |
| lockout_duration_secs | 锁定时长 |

## 皮肤建议
- 修改 password_min_length 后提示"现有用户下次改密时强制" 
- 锁定策略改动写入审计日志，UI 提示
