# Features · Manage · Mounts

## 路由
- `/manage/media/mounts`

## 数据
- [../../api/domains/manage/mounts.md](../../api/domains/manage/mounts.md)
- pan115 子流程：[../../api/domains/manage/pan115.md](../../api/domains/manage/pan115.md)

## UI

**列表**：名称 / provider 类型 / 状态 / 凭据状态 / 容量 / 操作  
**新建抽屉（MountDrawer）**：选 provider → 填配置（local 填路径 / pan115 走扫码）  
**详情**：基本信息 + 凭据卡（pan115 才有）+ 浏览目录入口  
**校验 / 刷新 / 解绑**按钮组

## pan115 内嵌组件
- Pan115CredentialsSection：扫码弹窗 + cookie_app `<select>` + 4 按钮（刷新/检测/解绑/重扫）
- 浏览目录弹窗：上一级 / 刷新 / 文件夹下钻

## 皮肤建议
- 凭据状态 expired 时高亮 + 一键"重新扫码"
- 凭据 unbound 时禁用「校验」「浏览」
- 不在前端任何 DOM 渲染密钥字段
