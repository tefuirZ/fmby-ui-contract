# Acceptance · Functional Checklist

按 [features/](../features/) 全量清单核对。每项必须可达且可用。

## 浏览侧

- [ ] `/login` 表单可提交，错误账号/密码 → 行内提示
- [ ] `/register`（开放注册时）注册码 + 用户名 + 密码三字段验证
- [ ] `/`（已登录）正确落到 discover 或默认库
- [ ] `/discover` Hero / 库入口 / 最近添加 / 继续观看 全块加载或友好降级
- [ ] `/library` 列出所有可见库
- [ ] `/library/:id` 筛选 / 排序 / 搜索 / 网格列表切换 / 分页
- [ ] `/library/:id/items/:itemId` Hero / 演职员 / 文件源选择 / 季集（剧集）
- [ ] `/play/:itemId` 播放控件 / 字幕音轨 / 进度上报 / 外部播放
- [ ] `/profile` 头像 + 角色 + 统计 + 登出
- [ ] `/settings/profile`、`/settings/playback`、`/settings/appearance` 全可用

## 管理侧

- [ ] `/manage/overview` 6 张卡 + 下钻
- [ ] `/manage/site/advanced` runtime + workers + errors
- [ ] `/manage/media/items` 列表 + 筛选 + 详情 + 识别 + 刮削 + artwork + 字幕 + 元数据手改
- [ ] `/manage/media/libraries` 列表 + 抽屉 + 数据源子路径选择 + 扫描
- [ ] `/manage/media/mounts` 列表 + 抽屉 + pan115 扫码 + pan115-share 多分享项 + 挂载级分享 Cookie + 浏览目录
- [ ] `/manage/media/probe-tasks` 列表 + 立即排队
- [ ] `/manage/media/naming-scrape` 设置 + imghost 开关 + 批量重刮
- [ ] `/manage/site/users/accounts` 列表 + 详情 + 批量 + 重置密码
- [ ] `/manage/site/users/role-templates` CRUD + 权限矩阵
- [ ] `/manage/site/users/registration-codes` 批量发码 + 导出 + 吊销
- [ ] `/manage/site/security/sessions` 列表 + 踢
- [ ] `/manage/site/security/audit-logs` 列表 + diff
- [ ] `/manage/site/security/runtime-logs` 列表 + 复制 trace_id
- [ ] `/manage/site/settings` general / security / session-policy 全字段
- [ ] `/manage/task-center` 顶部卡 + 任务流 + actions
- [ ] `/manage/tools/pan115-imghost` 凭据 + 上传 + 资产 + mirror_status；后端未启用时页面内展示配置引导而不是 404

## 状态

- [ ] loading / empty / error / forbidden / unauthorized / partial / outdated 全实现
- [ ] 离线 banner
- [ ] 限流 toast + 退避

## 反馈

- [ ] 危险操作二次确认
- [ ] 长任务提交后 toast + 跳任务中心
- [ ] mutation 后失效相关查询自动刷新
