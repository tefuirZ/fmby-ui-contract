# Features · Manage · Media Items

## 路由
- `/manage/media/items`：列表
- `/manage/media/items/:itemId`：详情
- `/manage/media/add`：新增（手工添加）

## 数据
- [../../api/domains/manage/media-items.md](../../api/domains/manage/media-items.md)
- [../../api/domains/manage/media-reviews.md](../../api/domains/manage/media-reviews.md)

## UI

**列表**：海报缩略 + 标题年份 + 状态 + 操作菜单（识别 / 刮削 / 删除）  
筛选：library_id / status / q / order  
**详情** Tab：基本信息 / 演职员 / 文件源 / Artwork / 字幕 / 任务历史

## 关键操作
- **识别**：输入 TMDB / TVDB / 豆瓣 ID 重识别
- **刮削**：触发 / 强制刷新（含 artwork）
- **手改字段**：标记 manual_override，提示用户重置可恢复
- **artwork 上传**：拖拽多图 + 类型选择（poster / backdrop / logo）+ 预览
- **字幕上传**：srt / ass / vtt 白名单
- **删除文件源**：移除该文件与条目的关联（不删盘上文件）

## 皮肤建议
- 操作菜单按 `available_actions` 动态渲染
- 错误（如 415 unsupported）显示在抽屉内行内
- artwork 列表区分 scrape vs override，override 优先展示
