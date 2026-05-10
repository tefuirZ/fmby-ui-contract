# Features · States (UI 状态规范)

每页面都必须实现以下状态，皮肤负责视觉但不可省略。

## 通用状态

| 状态 | 触发 | 必需元素 |
|------|------|----------|
| `loading` | 首屏请求未返回 | 骨架屏或 spinner，禁止白屏 |
| `empty` | 列表请求成功但 0 条 | 友好图 + 引导文案 + 主操作按钮 |
| `error` | 网络/服务端 5xx | 错误描述 + 重试按钮 + trace_id（可复制） |
| `forbidden` | 403 | "无权限"页 + 返回按钮 |
| `unauthorized` | 401（首屏 fetch） | 自动跳 `/login?next=...` |
| `partial` | 部分失败（如批量操作） | 表格内行级 error 标记 + 顶部 toast 汇总 |
| `outdated` | 后端版本不匹配（manifest.compat） | 全屏遮罩 + "皮肤需升级" + 文档链接 |

## 列表通用

- 分页：`page` + `page_size`，默认 page_size=20，上限 100
- 排序：`order=field:asc|desc`
- 过滤：见各端点
- 多选：选中态可视、批量动作 fixed 顶/底栏
- 刷新：手动按钮 + 数据失效（mutation 后）自动失效

## 表单通用

- 字段错误来自 `errors.fields`（[errors.md](../api/errors.md)）→ 行内红字
- 顶部错误来自 `errors.message` → toast / banner
- 提交中禁用按钮 + spinner
- 危险操作二次确认（删除、解绑、重置密码、强踢）

## 长任务（扫描 / 刮削 / 上传 / 回填）

- 提交后 toast：「已提交，跳转任务中心？」
- 实时进度通过 `task-center` 端点轮询（非强制 SSE）
- 失败可重试（actions 按钮）

## 网络降级

- 离线：顶部 banner「网络不可用」+ 缓存视图
- 长轮询超时（408）：自动重试 3 次，再失败弹错
- 限流（429）：toast + 退避按钮（默认 5s 灰）

## 可访问性

- 焦点环：键盘可见
- 对话框：Esc 关闭、初始焦点在主按钮
- 列表：方向键导航（可选）
- 颜色不是唯一信息载体（状态用图标 + 文字双标）

## 皮肤切换瞬时

- bootstrap.json 加载失败 → 回退默认皮肤 + 顶部错误条
- 皮肤热切换：跳转后整页 reload（避免组件状态残留），见 [skin-package/lifecycle.md](../skin-package/lifecycle.md)
