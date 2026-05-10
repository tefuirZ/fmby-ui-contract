import { test, expect, type Page } from '@playwright/test';

/**
 * 公共页（登录页）多分辨率视觉回归。
 *
 * 后端可能未运行：屏蔽所有 /api/* 请求，让前端走 fallback 渲染。
 * 通过等待 networkidle + 短延迟保证布局稳定。
 *
 * 首次本机生成 baseline：`npm run visual:update`
 * 回归校验：`npm run visual:test`
 */

async function gotoLogin(page: Page) {
  await page.route('**/api/**', (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'mocked' }),
    }),
  );
  await page.goto('/login', { waitUntil: 'networkidle' });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(500);
}

test.describe('login page visual', () => {
  test('login form static snapshot', async ({ page }) => {
    await gotoLogin(page);
    await expect(page).toHaveScreenshot('login.png', { fullPage: true });
  });
});
