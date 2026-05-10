# Features · Settings · Playback

播放偏好。

## 路由
- `/settings/playback`

## 数据
- `PATCH /api/me/preferences`

## 字段

| 字段 | 类型 | 说明 |
|------|------|------|
| max_streaming_bitrate | number | 上限码率（kbps） |
| preferred_audio_lang | string | 默认音轨 |
| preferred_subtitle_lang | string | 默认字幕 |
| subtitle_offset | number | 字幕偏移（秒） |
| auto_play_next | bool | 自动下一集 |
| skip_intro | bool | 跳片头 |
| skip_credits | bool | 跳片尾 |
| external_player | string | iina / vlc / mxplayer / 关 |

## 皮肤建议
- 字幕偏移用 ±0.5s 步进按钮 + 数字输入
- 外部播放器在不支持平台禁用 + 说明
- 设置即时生效（mutation 成功后失效相关查询）
