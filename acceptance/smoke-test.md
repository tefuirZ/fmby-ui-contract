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
  await expect(page).toHaveURL(/\/$/);

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

  const canonicalRoutes = [
    '/manage',
    '/manage/task-center',
    '/manage/media/add',
    '/manage/media/items',
    '/manage/media/reviews',
    '/manage/media/libraries',
    '/manage/media/collections',
    '/manage/media/mounts',
    '/manage/media/upstreams',
    '/manage/media/probe-tasks',
    '/manage/media/naming-scrape',
    '/manage/media/naming-cleanup',
    '/manage/media/pan115-imghost',
    '/manage/site/users/registration-codes',
    '/manage/site/users/accounts',
    '/manage/site/users/role-templates',
    '/manage/site/security/sessions',
    '/manage/site/security/audit-logs',
    '/manage/site/security/runtime-logs',
    '/manage/site/license',
    '/manage/site/developer-api',
    '/manage/site/about',
    '/manage/site/settings',
    '/manage/site/advanced',
  ];

  for (const route of canonicalRoutes) {
    await page.goto(route);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  }

  await page.goto('/manage/media/collections');
  await page.getByRole('button', { name: '新建合集' }).click();
  await page.getByLabel('合集标题').pressSequentially('A');
  await expect(page.getByLabel('合集标题')).toBeFocused();
  await page.getByLabel('合集标题').press('Enter');
  await expect(page.getByRole('dialog', { name: '新建合集' })).toBeVisible();

  await page.goto('/manage/site/users/role-templates');
  await page.getByRole('button', { name: '新建模板' }).click();
  await page.getByLabel('模板名称').pressSequentially('A');
  await expect(page.getByLabel('模板名称')).toBeFocused();
  await page.getByLabel('模板名称').press('Enter');
  await expect(page.getByRole('dialog', { name: '新建模板' })).toBeVisible();

  await page.goto('/manage/site/users/accounts');
  await page.getByRole('button', { name: '新建用户' }).click();
  await page.getByLabel('用户名').pressSequentially('a');
  await expect(page.getByLabel('用户名')).toBeFocused();
  await page.getByLabel('用户名').press('Enter');
  await expect(page.getByRole('dialog', { name: '新建用户' })).toBeVisible();

  await page.goto('/manage/media/libraries');
  await page.getByRole('button', { name: '新建媒体库' }).click();
  await page.getByRole('button', { name: '保存媒体库' }).click();
  await expect(page.getByText('请输入媒体库名称。')).toBeVisible();
  await expect(page.getByRole('button', { name: '保存媒体库' })).toBeVisible();

  await page.goto('/manage/media/mounts');
  await page.getByRole('button', { name: '新建数据源' }).click();
  await page.getByRole('button', { name: '保存数据源' }).click();
  await expect(page.getByText('请输入数据源名称。')).toBeVisible();
  await expect(page.getByRole('button', { name: '保存数据源' })).toBeVisible();

  await page.locator('.tableShell tbody tr').first().getByRole('button', { name: /删除/ }).click();
  await expect(page.getByRole('dialog', { name: '删除数据源' })).toBeVisible();
  await expect(page.getByPlaceholder('delete-mount')).toBeVisible();
});
```

## 管理后台基线

- 管理后台 smoke 必须使用真实管理员账号，不允许只靠 mock 数据或静态合同页说“能打开”。
- canonical `/manage/*` 路由加载时不得新增 `console error` 或 `pageerror`。
- 关键表单弹窗至少覆盖：
  - 合集新建
  - 角色模板新建
  - 用户新建
  - 媒体库新建
  - 数据源新建
- 文本输入框输入首字符后不得自动失焦；在普通文本输入上按 `Enter` 不得把弹窗直接关掉。
- 校验报错后主按钮必须仍然可见，不能出现“提示出来了，但保存按钮没了”。
- 数据源删除必须进入危险确认，展示引用影响，并要求输入固定确认串 `delete-mount`。

## CI 集成

- GitHub Actions / GitLab CI：PR 触发
- 失败截图 + 视频归档
- a11y 与冒烟同跑
