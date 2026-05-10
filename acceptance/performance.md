# Acceptance · Performance

## 基线

| 页面 | LCP | CLS | TTI | JS gzip |
|------|-----|-----|-----|---------|
| /login | < 1.5s | < 0.05 | < 2s | - |
| /discover | < 2.5s | < 0.1 | < 3.5s | - |
| /library/:id | < 2.5s | < 0.1 | < 3.5s | - |
| /play/:itemId | < 3s（视频起播）| - | - | - |
| /manage/* | < 2.5s | < 0.1 | < 3s | - |

首屏总 JS gzip ≤ 200 KB（强烈推荐 ≤ 100 KB）。

## 工具

- Lighthouse CI：每次发版
- WebPageTest（按需）
- Chrome DevTools Coverage：找未使用代码

## 检查项

- [ ] 路由级 code splitting
- [ ] 图片懒加载 + blurhash
- [ ] 海报 srcset 多分辨率
- [ ] 字体子集化或 swap
- [ ] 列表虚拟滚动（> 100 行）
- [ ] 防抖搜索（300ms）
- [ ] mutation 后只失效相关查询，不全局重拉

## 网络降级

- [ ] 慢 3G 下首页可看（骨架屏）
- [ ] 离线状态有提示
- [ ] 失败请求有重试
