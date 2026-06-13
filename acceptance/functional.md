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
- [ ] `/libraries/:id` 筛选 / 排序 / 搜索 / 网格列表切换 / 分页；如果采用无限滚动，接近底部时必须自动续页，不能强制用户再点“加载更多”
- [ ] `/libraries/:id` 海报墙卡片宽度稳定、纵横比稳定，不出现桌面端巨卡或因标题/状态变化导致整行抖动
- [ ] `/item/:itemId` Hero / 演职员 / 文件源选择 / 季集（剧集）
- [ ] `/play/:itemId` 播放控件 / 字幕音轨 / 进度上报 / 外部播放
- [ ] `/settings/profile`、`/settings/playback`、`/settings/appearance` 全可用

## 管理侧

- [ ] `/manage` 运营看板 7/30/90 天切换 + 热播榜 + 播放用户 + 三类趋势
- [ ] `/manage` 首次配置未完成时仍显示引导
- [ ] `/manage/task-center` 顶部卡 + 任务流 + actions
- [ ] `/manage/media/add` 引导页可达，入口与后续管理页跳转正常
- [ ] `/manage/site/advanced` runtime + workers + errors
- [ ] `/manage/media/items` 列表 + 筛选 + 详情 + 识别 + 刮削 + artwork + 字幕 + 元数据手改
- [ ] `/manage/media/libraries` 列表 + 抽屉 + 数据源子路径选择 + 扫描；空名称校验后保存按钮仍可见，不能因为报错把主操作藏掉
- [ ] `/manage/media/collections` 卡片列表 + 预置合集 + 豆瓣片单预览/创建 + 详情工作区 + 成员维护 + 删除 + 打开前台
- [ ] `/manage/media/mounts` 列表 + 抽屉 + pan115 扫码 + pan115-share 多分享项 + 挂载级分享 Cookie + 浏览目录
- [ ] `/manage/media/mounts` 空名称校验后保存按钮仍可见；删除必须进入危险确认并要求输入 `delete-mount`
- [ ] `/manage/media/mounts` 创建 Microsoft 数据源闭环：选择 microsoft-global / microsoft-china → OneDrive / SharePoint → 授权地址展示 / 打开 / 复制 → 粘贴完整 callback URL → token complete → drive/site → 导入持久账号 → 选择 root path → 创建来源
- [ ] `/manage/media/upstreams` AppleCMS / Emby 上游源 + 绑定 + 同步 + 导入预览；手动探活后状态必须反映当前真实返回，不得把已经恢复的上游继续渲染成“不可达”
- [ ] `/manage/media/probe-tasks` 列表 + 立即排队
- [ ] `/manage/media/naming-scrape` 设置 + imghost 开关 + 批量重刮
- [ ] `/manage/site/users/accounts` 列表 + 详情 + 批量 + 重置密码；新建/编辑弹窗输入首字符后不得失焦，`Enter` 不得直接关闭模态框
- [ ] `/manage/site/users/role-templates` CRUD + 权限矩阵；新建/编辑弹窗输入首字符后不得失焦，`Enter` 不得直接关闭模态框
- [ ] `/manage/site/users/registration-codes` 批量发码 + 导出 + 吊销
- [ ] `/manage/site/security/sessions` 列表 + 踢
- [ ] `/manage/site/security/audit-logs` 列表 + diff + `detail_json`
- [ ] `/manage/site/security/runtime-logs` 列表 + 复制 trace_id + `raw_line/request_id/source_file`
- [ ] `/manage/site/license` 授权状态 + 设备码 + 激活 token + 手动心跳
- [ ] `/manage/site/developer-api` Token 创建 + Token 列表 + endpoint catalog + Explorer
- [ ] `/manage/site/about` 版本 / 依赖 / 系统摘要
- [ ] `/manage/site/settings` general / security / session-policy 全字段
- [ ] `/manage/media/pan115-imghost` 凭据 + 上传 + 资产 + mirror_status；后端未启用时页面内展示配置引导而不是 404

## 状态

- [ ] loading / empty / error / forbidden / unauthorized / partial / outdated 全实现
- [ ] canonical `/manage/*` 路由打开时不出现 `console error` / `pageerror`
- [ ] 离线 banner
- [ ] 限流 toast + 退避
- [ ] `/api/*` 返回非 JSON 时显示诊断错误，不出现原生 `Unexpected token '<'`

## 反馈

- [ ] 危险操作二次确认
- [ ] 危险操作需要固定确认串时，前端必须展示明确输入位和 action key，不能只留一个没有上下文的文本框
- [ ] 文本输入框输入首字符后不失焦；普通文本输入上的 `Enter` 不得把模态框直接关掉
- [ ] 表单校验报错后主按钮仍可见，提交区不跳动
- [ ] 长任务提交后 toast + 跳任务中心
- [ ] mutation 后失效相关查询自动刷新

## 安全存储

- [ ] Microsoft 授权地址、完整 callback URL、access token、refresh token、tenant 信息和中间授权态仅保存在页面内存，不写 localStorage / sessionStorage / IndexedDB / URL query / 日志 / 持久表单草稿
- [ ] Microsoft 创建向导不得只提供孤立“导入持久账号”按钮；导入后必须继续目录选择和创建来源
