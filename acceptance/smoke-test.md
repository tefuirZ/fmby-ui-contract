# Acceptance · Smoke Test

冒烟脚本（Playwright 推荐）。

## 主流程

```ts
test('full smoke', async ({ page }) => {
  // 登录
  await page.goto('/login');
  await page.fill('[name=username]', 'admin');
  await page.fill('[name=password]', 'admin-pass');
  await page.click('button[type=submit]');
  await expect(page).toHaveURL(/\/(discover|library)/);

  // 浏览
  await page.click('text=媒体库');
  await page.click('.library-card >> nth=0');
  await page.click('.item-card >> nth=0');

  // 详情 → 播放
  await page.click('text=立即播放');
  await page.waitForSelector('video');
  await expect(page.locator('video')).toBeVisible();

  // 返回 + 登出
  await page.goBack();
  await page.click('[data-test=user-menu]');
  await page.click('text=登出');
  await expect(page).toHaveURL(/\/login/);
});
```

## 管理流程

```ts
test('admin manage smoke', async ({ page, login }) => {
  await login('admin');

  await page.goto('/manage/overview');
  await expect(page.locator('text=用户')).toBeVisible();

  await page.goto('/manage/site/users/accounts');
  await expect(page.locator('table')).toBeVisible();

  await page.goto('/manage/media/libraries');
  await expect(page.locator('text=新建库')).toBeVisible();
});
```

## CI 集成

- GitHub Actions / GitLab CI：PR 触发
- 失败截图 + 视频归档
- a11y 与冒烟同跑
