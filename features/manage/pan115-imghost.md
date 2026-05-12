# Features · Manage · Pan115 Imghost

> Feature gate：
>
> - 产品契约层：`bootstrap.features.pan115_imghost_enabled`
> - 经典 WebUI 仅允许把 `VITE_FEATURE_PAN115_IMGHOST=1` 当作开发期强制开关
>
> 新皮肤必须以后端 bootstrap 为唯一真相；构建期开关只能用于本地联调，不能绕过后端能力门禁。

## 路由
- `/manage/tools/pan115-imghost`

## 数据
- [../../api/domains/manage/pan115-imghost.md](../../api/domains/manage/pan115-imghost.md)

## UI

**主叙事**：`115 图床` 是“刮削产物镜像系统”，不是管理员常态化手工上传工具。

**治理说明卡**：必须明确展示以下语义：
- 新刮削图片进入统一镜像任务
- 开启治理或扩大范围时会自动回补历史图片
- 图床失败不影响刮削成功态
- 关闭本地副本只影响新任务，不删除历史文件

**凭据卡**：扫码弹窗 + cookie_app `<select>` + 状态徽标 + 解绑按钮

**任务中心入口**：必须能从该页跳到 `/manage/task-center?category=Imghost`

**资产观测区**：保留镜像资产列表，用于观测 mirror 状态和排障，不再把它包装成主要上传工作台

**手工上传区**：可保留，但只能是二级/折叠排障入口，不能作为页面主叙事

## mirror_status 徽标
- ok：绿
- pending：蓝（旋转）
- referer_blocked：黄
- quota_exceeded：红
- failed：红 + 重试按钮

## 皮肤建议
- 凭据未绑时给出清晰引导，但不要阻止管理员查看治理说明和历史资产状态
- 手工上传按钮默认折叠，仅在排障时展开
- 复制按钮：`navigator.clipboard` 主路径 + `execCommand` fallback（HTTP 局域网兼容）
