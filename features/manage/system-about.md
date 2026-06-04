# Features · Manage · System About

系统关于页是只读运维信息页，用于展示版本、分发链接、依赖状态和部署摘要。

## 路由

- `/manage/site/about`

## 数据

- [../../api/domains/manage/system-about.md](../../api/domains/manage/system-about.md)

## UI

- 应用信息：名称、版本、release tag、commit、build time、build channel。
- 分发链接：GitHub profile、source repo、distribution repo、DockerHub、changelog。
- 运行信息：目标 OS/arch、Rust package version、features。
- 依赖状态：PostgreSQL、Redis、后端依赖与 warnings。

## 安全

- 只读页面，不提供运行配置编辑入口。
- 不展示 PostgreSQL URL、Redis URL、密码、token、Cookie、license key 或 provider 凭据。
- GitHub 归属固定 `tefuirZ`；DockerHub 固定 `itefuir/fmby`。

## 状态

- loading
- error + retry
- dependencies warning
- Redis 未配置但可降级
- unknown build metadata
