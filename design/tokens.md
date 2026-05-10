# Design · Tokens

CSS Custom Properties，所有皮肤的颜色 / 间距 / 字号都通过 tokens 暴露。

## 颜色（semantic）

```css
:root {
  /* 表面 */
  --color-bg-base:      #ffffff;
  --color-bg-elevated:  #f7f7f8;
  --color-bg-overlay:   rgba(0,0,0,.4);

  /* 文本 */
  --color-text-primary:    #0a0a0b;
  --color-text-secondary:  #555;
  --color-text-disabled:   #999;
  --color-text-inverse:    #fff;

  /* 边框 */
  --color-border-default:  #e5e5e7;
  --color-border-strong:   #c7c7c9;

  /* 强调 */
  --color-accent-default:  #2563eb;
  --color-accent-hover:    #1d4ed8;

  /* 状态 */
  --color-status-success:  #16a34a;
  --color-status-warning:  #d97706;
  --color-status-danger:   #dc2626;
  --color-status-info:     #0891b2;
}

[data-theme="dark"] {
  --color-bg-base:      #0a0a0b;
  --color-bg-elevated:  #18181b;
  --color-text-primary: #fafafa;
  /* ... */
}
```

## 间距（4px 基准）

```css
--space-0:  0;
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-6:  24px;
--space-8:  32px;
--space-12: 48px;
--space-16: 64px;
```

## 字号

```css
--font-size-xs:  12px;
--font-size-sm:  14px;
--font-size-md:  16px;
--font-size-lg:  18px;
--font-size-xl:  24px;
--font-size-2xl: 32px;
```

## 圆角 / 阴影 / z-index

```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;

--shadow-sm:  0 1px 2px rgba(0,0,0,.05);
--shadow-md:  0 4px 6px rgba(0,0,0,.07);
--shadow-lg:  0 10px 15px rgba(0,0,0,.1);

--z-dropdown:  1000;
--z-modal:     1100;
--z-toast:     1200;
```

## 皮肤覆盖

皮肤包通过 `:root[data-skin="<id>"]` 选择器覆盖任意 token。组件实现引用 token，永不硬编码 hex。
