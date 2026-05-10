# Design · Components

皮肤必须提供以下组件（命名可自由，行为必须一致）。

## 基础

- **Button**：variant=primary/secondary/ghost/danger；size=sm/md/lg；loading 态禁用 + spinner
- **Input / Textarea**：错误态行内提示；clear 按钮可选
- **Select**：单选 / 多选；可搜索（>10 项）
- **Checkbox / Radio / Switch**
- **Dialog / Drawer**：Esc 关闭、初始焦点、焦点陷阱
- **Toast**：success / warning / error / info；自动消失 + 可手关
- **Banner**：顶部提示（离线 / 版本不匹配）
- **Skeleton**：列表 / 卡片 / 详情分别有占位
- **Spinner**：小（按钮内）/ 大（首屏）

## 数据展示

- **Table**：分页 / 排序 / 多选 / 行展开 / 行内操作菜单
- **Card**：海报 / 信息 / 操作三段
- **List**：行 / 卡片视图切换
- **Badge / Tag**：状态徽标
- **Avatar**：图片 / 文字 fallback

## 反馈

- **Confirm**：危险操作二次确认（删除 / 解绑 / 重置）
- **Empty**：图 + 文案 + 主操作
- **ErrorState**：错误描述 + trace_id 复制 + 重试

## 业务

- **Pan115QrModal**：扫码 + cookie_app 选择 + 倒计时 + 长轮询
- **MountBrowser**：浏览目录（树/列表/面包屑皮肤选）
- **TaskProgress**：进度条 + 状态徽标 + 操作按钮
- **DiffViewer**：审计日志 before/after 对比
- **VideoPlayer**：见 [features/browse/play.md](../features/browse/play.md)

## 通用行为

- 所有交互组件支持键盘
- Modal/Drawer 打开时背景禁止滚动
- 表单提交禁用按钮 + spinner
- 网络错误统一通过 errorState 而非 alert
