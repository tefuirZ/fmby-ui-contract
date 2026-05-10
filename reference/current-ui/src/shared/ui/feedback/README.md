# Toast 通知

轻量自建 Toast，无第三方依赖。队列上限 5 条，单条默认 4s 自动消失（error 默认 6s）。

## 用法

```tsx
// 1) 在应用根（如 main.tsx）挂载 Provider
import { ToastProvider } from '@/shared/ui/feedback';

<ToastProvider>
  <App />
</ToastProvider>;

// 2) 任意组件内调用
import { useToast } from '@/shared/ui/feedback';

const { toast } = useToast();
toast.success({ title: '保存成功' });
toast.error({ title: '提交失败', description: '请稍后重试', durationMs: 8000 });
toast.dismiss(); // 关闭全部；toast.dismiss(id) 关闭单条
```

## API

- `toast.success / error / warning / info({ title, description?, durationMs? })` 返回 `id: string`
- `toast.dismiss(id?)` 不传 id 关闭全部
- 桌面端右下角上滑入场，移动端（≤1023px）顶部下滑入场
- a11y：默认 `role="status" aria-live="polite"`，error 使用 `role="alert" aria-live="assertive"`
