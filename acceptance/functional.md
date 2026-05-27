# Acceptance · Functional Checklist

按 [features/](../features/) 全量清单核对。每项必须可达且可用。

## 浏览侧

- [ ] `/login` 表单可提交，错误账号/密码 → 行内提示
- [ ] `/login` 遇到 `mfa_required` 可完成 TOTP 二次验证
- [ ] `/register`（开放注册时）注册码 + 用户名 + 密码三字段验证
- [ ] `/install` 在 `install.required=true` 时可完成安装 / 恢复状态展示
- [ ] `/`（已登录）首页 sections / 库入口 / 最近添加 / 继续观看 全块加载或友好降级
- [ ] `/history` 播放历史 cursor 分页
- [ ] `/libraries` 列出所有可见库
- [ ] `/libraries/:id` 筛选 / 排序 / 搜索 / 网格列表切换 / 分页
- [ ] `/item/:itemId` Hero / 演职员 / 文件源选择 / 季集（剧集）
- [ ] `/play/:itemId` 播放控件 / 字幕音轨 / 进度上报 / 外部播放
- [ ] `/settings/profile`、`/settings/playback`、`/settings/appearance` 全可用

## 管理侧

- [ ] `/manage` 运营看板 7/30/90 天切换 + 热播榜 + 播放用户 + 三类趋势
- [ ] `/manage` 首次配置未完成时仍显示引导
- [ ] `/manage/site/advanced` runtime + workers + errors
- [ ] `/manage/media/items` 列表 + 筛选 + 详情 + 识别 + 刮削 + artwork + 字幕 + 元数据手改
- [ ] `/manage/media/libraries` 列表 + 抽屉 + 数据源子路径选择 + 扫描
- [ ] `/manage/media/mounts` 列表 + 抽屉 + pan115 扫码 + pan115-share 多分享项 + 挂载级分享 Cookie + 浏览目录
- [ ] `/manage/media/upstreams` AppleCMS / Emby 上游源 + 绑定 + 同步 + 导入预览
- [ ] `/manage/media/probe-tasks` 列表 + 立即排队
- [ ] `/manage/media/naming-scrape` 设置 + imghost 开关 + 批量重刮
- [ ] `/manage/site/users/accounts` 列表 + 详情 + 批量 + 重置密码
- [ ] `/manage/site/users/role-templates` CRUD + 权限矩阵
- [ ] `/manage/site/users/registration-codes` 批量发码 + 导出 + 吊销
- [ ] `/manage/site/security/sessions` 列表 + 踢
- [ ] `/manage/site/security/audit-logs` 列表 + diff
- [ ] `/manage/site/security/runtime-logs` 列表 + 复制 trace_id
- [ ] `/manage/site/license` 授权状态 + 设备码 + 激活 token + 手动心跳
- [ ] `/manage/site/settings` general / security / session-policy 全字段
- [ ] `/manage/task-center` 顶部卡 + 任务流 + actions
- [ ] `/manage/media/pan115-imghost` 凭据 + 上传 + 资产 + mirror_status；后端未启用时页面内展示配置引导而不是 404

## 状态

- [ ] loading / empty / error / forbidden / unauthorized / partial / outdated 全实现
- [ ] 离线 banner
- [ ] 限流 toast + 退避
- [ ] `/api/*` 返回非 JSON 时显示诊断错误，不出现原生 `Unexpected token '<'`

## 反馈

- [ ] 危险操作二次确认
- [ ] 长任务提交后 toast + 跳任务中心
- [ ] mutation 后失效相关查询自动刷新
