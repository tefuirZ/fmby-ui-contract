import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright 多分辨率视觉回归配置。
 *
 * 设计原则：
 * - 仅 Chromium，避免跨浏览器 baseline 抖动
 * - 5 档分辨率覆盖手机 / 平板 / 小笔电 / 桌面 / 大屏
 * - 截图差异容忍 0.2，绝大多数字体反锯齿差异都能吸收
 * - webServer 自动起 `npm run dev`，端口与 vite 一致 (3000)
 * - 登录页等公共页对后端 /api/* 不可达时 LoginPage 内有 fallback，截图仍可稳定输出
 */

const VIEWPORTS = [
  { name: 'mobile-375', width: 375, height: 812 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'laptop-1024', width: 1024, height: 768 },
  { name: 'desktop-1366', width: 1366, height: 768 },
  { name: 'desktop-1920', width: 1920, height: 1080 },
] as const;

export default defineConfig({
  testDir: './tests/visual',
  timeout: 60_000,
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
      caret: 'hide',
    },
  },
  fullyParallel: true,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
  projects: VIEWPORTS.map(({ name, width, height }) => ({
    name,
    use: {
      ...devices['Desktop Chrome'],
      viewport: { width, height },
    },
  })),
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
