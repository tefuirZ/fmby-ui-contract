# Features · Manage · Pan115 Imghost

> Feature gate：
>
> - 产品契约层：`features.pan115_imghost`
> - 当前 classic WebUI 构建常量：`PAN115_IMGHOST_ENABLED = true`
>
> 新皮肤应同时尊重这两层门禁，避免只因为构建常量打开就暴露未准备好的入口。

## 路由
- `/manage/tools/pan115-imghost`

## 数据
- [../../api/domains/manage/pan115-imghost.md](../../api/domains/manage/pan115-imghost.md)

## UI

**凭据卡**：扫码弹窗 + cookie_app `<select>` + 状态徽标 + 解绑按钮

**上传区**：拖拽 + multipart / 进度 / sha1 dedup 提示

**资产网格**：缩略图 + sha1 / size / mirror_status 徽标 + 复制 host_url（HTTP 走 fallback）+ 删除

**调试入口**：permanent-url / final-url（仅开发模式或显式开关）

## mirror_status 徽标
- ok：绿
- pending：蓝（旋转）
- referer_blocked：黄
- quota_exceeded：红
- failed：红 + 重试按钮

## 皮肤建议
- 凭据未绑时整页禁用 + "请先扫码绑定"引导
- 拖拽多图自动并发（≤ 3）
- 复制按钮：navigator.clipboard 主路径 + execCommand fallback（HTTP 局域网兼容）
