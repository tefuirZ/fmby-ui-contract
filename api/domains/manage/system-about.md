# Manage · System About

系统关于信息：用于管理端只读展示版本、分发链接、运行依赖和部署摘要。

## 端点

| Method | Path | 说明 |
|--------|------|------|
| GET | `/api/manage/system/about` | 系统关于信息 |

## 权限

- Cookie session
- `manage:access`
- `manage:advanced`

## 响应

```jsonc
{
  "generated_at": "2026-06-04T12:00:00Z",
  "app": {
    "name": "FMBY",
    "version": "0.0.6",
    "release_tag": "v0.0.6",
    "commit_sha": "abcdef",
    "build_time": "2026-06-04T10:00:00Z",
    "build_channel": "release"
  },
  "links": {
    "github_profile": "https://github.com/tefuirZ",
    "source_repo": "https://github.com/tefuirZ/fmby",
    "distribution_repo": "https://github.com/tefuirZ/fmby-release",
    "dockerhub_repo": "https://hub.docker.com/r/itefuir/fmby",
    "changelog": "https://github.com/tefuirZ/fmby-release/releases"
  },
  "runtime": {
    "rust_package_version": "0.0.6",
    "target_os": "linux",
    "target_arch": "x86_64",
    "features": ["postgres"]
  },
  "dependencies": [
    {
      "id": "postgres",
      "name": "PostgreSQL",
      "status": "ok",
      "required": true,
      "version": null,
      "message": null
    }
  ],
  "deployment": {
    "database": { "configured": true, "status": "ok", "message": null },
    "redis": { "configured": false, "status": "skipped", "message": "未配置 Redis" }
  },
  "warnings": []
}
```

## 安全边界

- GitHub 主页、源码仓和分发仓归属固定为 `tefuirZ`。
- DockerHub 仓库固定为 `itefuir/fmby`。
- 响应不得包含 PostgreSQL URL、Redis URL、密码、token、Cookie、license key、115 / Microsoft / upstream 凭据。
- 页面不得自动展开原始 JSON 或显示未知敏感字段。

> 权威：主仓 `crates/fmby-api/src/manage/dto/about.rs` 与 `crates/fmby-api/src/manage/routes/about.rs`。
