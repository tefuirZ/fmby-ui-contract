import { Link, isRouteErrorResponse, useRouteError } from 'react-router';

export function RouteErrorPage() {
  const error = useRouteError();

  let title = '页面加载失败';
  let description = '页面出现异常，请刷新后重试。';

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = '页面不存在';
      description = '你访问的页面不存在，返回首页继续浏览。';
    } else if (error.status === 403) {
      title = '无权限访问';
      description = '当前账号没有访问此页面的权限。';
    } else {
      title = `请求失败 (${error.status})`;
      description = typeof error.data === 'string' ? error.data : description;
    }
  } else if (error instanceof Error) {
    description = error.message;
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'var(--bg-base)',
      }}
    >
      <section
        style={{
          width: 'min(560px, 100%)',
          padding: '2rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-default)',
          background: 'var(--surface-1)',
          boxShadow: 'var(--shadow-l2)',
        }}
      >
        <div
          style={{
            color: 'var(--brand-gold)',
            fontSize: 'var(--text-caption)',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          FMBY
        </div>
        <h1 style={{ marginTop: '0.75rem', fontSize: 'var(--text-h1)' }}>{title}</h1>
        <p style={{ marginTop: '0.75rem', color: 'var(--text-secondary)' }}>
          {description}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '120px',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--brand-gold)',
              color: '#0B0D12',
              fontWeight: 700,
            }}
          >
            回首页
          </Link>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '120px',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              background: 'var(--surface-2)',
              color: 'var(--text-primary)',
            }}
          >
            刷新
          </button>
        </div>
      </section>
    </main>
  );
}
