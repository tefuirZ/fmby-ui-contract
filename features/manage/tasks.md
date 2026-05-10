# Features · Manage · Tasks

含探针、命名刮削设置、命名清理、扫描历史。

## 路由
- `/manage/media/probe-tasks`
- `/manage/media/naming-scrape`（命名刮削设置 + 重刮）
- `/manage/media/scans`（扫描历史，可选作为 task-center 下钻）

## 数据
- [../../api/domains/manage/tasks.md](../../api/domains/manage/tasks.md)

## UI

**探针**：表格列出 source / 周期 / 上次结果 / 操作（立即排队 / 重置）；mini 趋势图（24h 成功率）  
**命名刮削设置**：开关 enabled / providers 多选 / 语言优先级 / **imghost_auto_upload 开关**（图床凭据未绑灰显）/ score_threshold 滑块  
**命名清理**：规则编辑器（regex_strip / tag_drop）+ "试运行"显示前后对比 → 用户确认后 replay-identify  
**批量重刮**：弹窗显示影响条目数 + 二次确认

## 皮肤建议
- imghost_auto_upload 灰显时 tooltip 引导去 `/manage/tools/pan115-imghost`
- regex 编辑加语法校验（前端 try `new RegExp`）
- 试运行结果分页 + 高亮差异
