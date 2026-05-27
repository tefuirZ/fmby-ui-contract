# Features · Settings · Playback

播放偏好。

## 路由
- `/settings/playback`

## 数据
- `GET /api/settings/user/playback`
- `PUT /api/settings/user/playback`

## 字段

| 字段 | 类型 | 说明 |
|------|------|------|
| default_audio_language | string \| null | 默认音轨语言 |
| default_subtitle_language | string \| null | 默认字幕语言 |
| auto_resume | bool | 自动从上次位置继续 |
| autoplay_next_episode | bool | 自动下一集 |
| prefer_external_player | bool | 优先外部播放器 |

## 皮肤建议
- `PUT` 是整体替换，保存前必须带全量字段。
- 外部播放器在不支持平台禁用。
- 设置即时生效（mutation 成功后失效相关查询）。
