# Assets

> 静态资源：海报 / 头像 / 字幕 / 视频流。

这些端点是 skin 的 `<img>` / `<video>` / `<track>` 直接消费的 URL。

---

## 端点速查

| 路径 | 方法 | 用途 |
|---|---|---|
| `/api/assets/items/{itemId}/images/{kind}` | GET | 媒体海报（primary / backdrop / logo / banner / thumb） |
| `/api/assets/people/{personId}/primary` | GET | 演员 / 导演头像 |
| `/api/assets/subtitles/{assetId}` | GET | 字幕文件（vtt / srt / ass） |
| `/api/assets/streams/{sourceId}` | GET, HEAD | 视频 / 音频流（支持 Range） |

---

## 通用约定

- ✅ 这些 URL 是**鉴权后**才能访问（cookie session 自动带）
- ✅ skin 直接当 `<img src>` / `<video src>` 使用，浏览器自动带 cookie
- ✅ 跨用户共享的资源（如海报）后端会做缓存 / CDN 直链
- ⚠️ 不要解析 URL 内部（路径参数可能改）

---

## 端点详解

### `GET /api/assets/items/{itemId}/images/{kind}`

`{kind}` 取值：

| kind | 形态 | 主要使用场景 |
|---|---|---|
| `primary` | 竖向（电影海报、剧集海报） | 卡片、详情页主图 |
| `backdrop` | 横向（剧照） | 详情页背景、幻灯片 |
| `logo` | 透明 PNG（剧集 logo） | 详情页标题层叠 |
| `banner` | 横长条 | 旧风格 banner |
| `thumb` | 单集缩略图 | episode 卡片 |

当前一方契约没有图片裁剪 / 转码 query。`width`、`height`、`quality`、`format` 这类参数不要作为稳定能力依赖。

响应：

- `200 OK` + 实际图片 `Content-Type`
- 可能 `302` 重定向到远端资源；302 响应按当前实现带 `private, no-store, max-age=0`
- `404` if no image

skin 用法：

```html
<img
  src={`/api/assets/items/${item.id}/images/primary`}
  loading="lazy"
  alt={item.title}
/>
```

### `GET /api/assets/people/{personId}/primary`

演员头像。同上，但只支持 `primary` kind（不传 kind）。

### `GET /api/assets/subtitles/{assetId}`

返回字幕文件原文。`Content-Type` 视格式：

- `text/vtt` for `.vtt`
- `application/x-subrip` for `.srt`
- `text/plain` for `.ass`

skin 推荐：

```html
<video src="...">
  <track
    kind="subtitles"
    src={`/api/assets/subtitles/${sub.id}`}
    srclang={sub.language}
    label={sub.title}
    default={sub.default}
  />
</video>
```

注意：浏览器原生 `<track>` 只支持 vtt。srt / ass 需要 skin 自己转或用 subtitles-octopus。

### `GET /api/assets/streams/{sourceId}` / `HEAD`

视频 / 音频流。**核心特性**：

- ✅ 支持 `Range` header（resumable / seek）
- ✅ HEAD 返回 `Content-Length`、`Accept-Ranges: bytes`、`Content-Type`，body 为空
- ✅ 可能 `302` 重定向到 CDN 直链（115 / WebDAV 透传时）
- ✅ HTTP/1.1 keep-alive，TCP 流水线友好

skin 用法（最简单）：

```html
<video src={`/api/assets/streams/${source.id}`} controls></video>
```

实际上 [`playback.md`](./playback.md) 的 `/api/playback/items/{id}` 决策响应里会**直接**给出 stream_url —— skin 用那个就行，不必手动拼。

---

## 缓存与失效

| 端点 | 缓存策略 |
|---|---|
| `/api/assets/items/.../images/*` | 可能返回本地字节或远端 302；不要假定可公开长期缓存 |
| `/api/assets/people/.../primary` | 同上 |
| `/api/assets/subtitles/{id}` | 可能返回本地字节或远端字节；不要假定长期缓存 |
| `/api/assets/streams/{id}` | 流 / 302 都不应被前端长期缓存 |

如果用户在后台修改了某个海报（[`manage/media-items.md`](./manage/media-items.md) 的 artwork override），URL 不变但内容可能变。skin 可在拼 URL 时加 `item.updated_at` 作为版本：

```ts
const imgUrl = `/api/assets/items/${item.id}/images/primary?v=${item.updated_at}`;
```

---

## 错误处理

| 状态 | 含义 |
|---|---|
| 200 | 成功 |
| 302 | 重定向到 CDN（如 115 直链） — 浏览器自动 follow |
| 401 | 未登录 |
| 403 | 无权访问该 item / source |
| 404 | 图片 / 字幕 / 流不存在 |
| 502 | 上游 provider 报错（如 115 limit） |

skin 处理：

- `<img>` `onError` 显示 placeholder
- `<video>` `error` 事件给"换源"按钮
- 字幕加载失败可以静默（无字幕降级）

---

## 与其它域的关系

- 详情页字段 `primary_image_url` / `backdrop_image_url` 已经是这些 URL 的拼装（见 [`items.md`](./items.md)）
- 播放器 src 来自 [`playback.md`](./playback.md) 的决策响应
- 后台 [`manage/media-items.md`](./manage/media-items.md) 上传 artwork override 后会反映到这里

---

## skin 实现建议

- 全局加 image lazy load（`loading="lazy"` + `IntersectionObserver`）
- 缓存层（service worker）可以 cache `/api/assets/items/.../images/*`，加速再次访问
- 视频播放优先用 `<video>` native，HLS / DASH 用 hls.js / dash.js wrapper
- 字幕：默认开 vtt，srt / ass 要做转换或第三方库
- 错误边界：每个图片 / 视频独立的 ErrorBoundary，不要让一个图挂掉整个页面
