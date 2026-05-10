/**
 * 登录页面
 *
 * 全屏沉浸式布局，中心毛玻璃卡片。
 * 支持三种入口：
 * 1. 常规登录
 * 2. 注册码注册
 * 3. 首次初始化创建管理员
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import clsx from 'clsx';

import { useSession } from '@/shared/hooks';
import {
  authApi,
  loginSchema,
  registerSchema,
  setupSchema,
  type LoginFormData,
  type RegisterFormData,
  type SetupFormData,
} from '@/domains/auth';
import { useZodForm } from '@/shared/forms';
import { queryKeys } from '@/shared/query-keys';
import type { User } from '@/shared/types';
import { getErrorMessage } from '@/shared/utils/error';

import styles from './LoginPage.module.css';

type EntryMode = 'login' | 'register';

interface LoginFormProps {
  onAuthenticated: (user: User) => void;
}

interface RegisterFormProps extends LoginFormProps {
  onPendingApproval: (message: string) => void;
}

function LoginForm({ onAuthenticated }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useZodForm(loginSchema);

  const mutation = useMutation({
    mutationFn: (data: LoginFormData) => authApi.login(data),
    onSuccess: (response) => {
      onAuthenticated(response.user);
    },
  });

  const onSubmit = handleSubmit((data) => {
    mutation.mutate(data);
  });

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {mutation.error ? (
        <div className={styles.errorBanner} role="alert">
          {getErrorMessage(mutation.error)}
        </div>
      ) : null}

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="login-username">
          用户名
        </label>
        <div className={styles.inputWrapper}>
          <input
            id="login-username"
            className={clsx(styles.input, errors.username && styles.inputError)}
            placeholder="请输入用户名"
            autoComplete="username"
            {...register('username')}
          />
        </div>
        {errors.username ? (
          <span className={styles.fieldError}>{errors.username.message}</span>
        ) : null}
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="login-password">
          密码
        </label>
        <div className={styles.inputWrapper}>
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            className={clsx(
              styles.input,
              styles.inputHasToggle,
              errors.password && styles.inputError,
            )}
            placeholder="请输入密码"
            autoComplete="current-password"
            {...register('password')}
          />
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? '隐藏密码' : '显示密码'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password ? (
          <span className={styles.fieldError}>{errors.password.message}</span>
        ) : null}
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? (
          <>
            <Loader2 size={18} className={styles.spinner} />
            登录中…
          </>
        ) : (
          '登录'
        )}
      </button>
    </form>
  );
}

function RegisterForm({
  onAuthenticated,
  onPendingApproval,
}: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useZodForm(registerSchema);

  const mutation = useMutation({
    mutationFn: (data: RegisterFormData) =>
      authApi.register({
        code: data.code,
        username: data.username,
        password: data.password,
        display_name: data.displayName || undefined,
      }),
    onSuccess: (response) => {
      if (response.status === 'authenticated' && response.user) {
        onAuthenticated(response.user);
        return;
      }

      onPendingApproval(response.message);
    },
  });

  const onSubmit = handleSubmit((data) => {
    mutation.mutate(data);
  });

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {mutation.error ? (
        <div className={styles.errorBanner} role="alert">
          {getErrorMessage(mutation.error)}
        </div>
      ) : null}

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="register-code">
          注册码
        </label>
        <div className={styles.inputWrapper}>
          <input
            id="register-code"
            className={clsx(styles.input, errors.code && styles.inputError)}
            placeholder="请输入管理员提供的注册码"
            autoComplete="one-time-code"
            {...register('code')}
          />
        </div>
        {errors.code ? (
          <span className={styles.fieldError}>{errors.code.message}</span>
        ) : (
          <span className={styles.fieldHint}>需要有效注册码才能完成注册。</span>
        )}
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="register-username">
          用户名
        </label>
        <div className={styles.inputWrapper}>
          <input
            id="register-username"
            className={clsx(styles.input, errors.username && styles.inputError)}
            placeholder="至少 3 个字符"
            autoComplete="username"
            {...register('username')}
          />
        </div>
        {errors.username ? (
          <span className={styles.fieldError}>{errors.username.message}</span>
        ) : null}
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="register-displayname">
          显示名称（可选）
        </label>
        <div className={styles.inputWrapper}>
          <input
            id="register-displayname"
            className={styles.input}
            placeholder="显示名称"
            autoComplete="name"
            {...register('displayName')}
          />
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="register-password">
          密码
        </label>
        <div className={styles.inputWrapper}>
          <input
            id="register-password"
            type={showPassword ? 'text' : 'password'}
            className={clsx(
              styles.input,
              styles.inputHasToggle,
              errors.password && styles.inputError,
            )}
            placeholder="至少 8 个字符"
            autoComplete="new-password"
            {...register('password')}
          />
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? '隐藏密码' : '显示密码'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password ? (
          <span className={styles.fieldError}>{errors.password.message}</span>
        ) : null}
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="register-confirm-password">
          确认密码
        </label>
        <div className={styles.inputWrapper}>
          <input
            id="register-confirm-password"
            type={showConfirm ? 'text' : 'password'}
            className={clsx(
              styles.input,
              styles.inputHasToggle,
              errors.confirmPassword && styles.inputError,
            )}
            placeholder="再次输入密码"
            autoComplete="new-password"
            {...register('confirmPassword')}
          />
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowConfirm((prev) => !prev)}
            aria-label={showConfirm ? '隐藏密码' : '显示密码'}
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.confirmPassword ? (
          <span className={styles.fieldError}>
            {errors.confirmPassword.message}
          </span>
        ) : null}
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? (
          <>
            <Loader2 size={18} className={styles.spinner} />
            注册中…
          </>
        ) : (
          '使用注册码注册'
        )}
      </button>
    </form>
  );
}

function SetupForm({ onAuthenticated }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useZodForm(setupSchema);

  const mutation = useMutation({
    mutationFn: (data: SetupFormData) =>
      authApi.setup({
        username: data.username,
        password: data.password,
        display_name: data.displayName || undefined,
      }),
    onSuccess: (response) => {
      onAuthenticated(response.user);
    },
  });

  const onSubmit = handleSubmit((data) => {
    mutation.mutate(data);
  });

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {mutation.error ? (
        <div className={styles.errorBanner} role="alert">
          {getErrorMessage(mutation.error)}
        </div>
      ) : null}

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="setup-username">
          用户名
        </label>
        <div className={styles.inputWrapper}>
          <input
            id="setup-username"
            className={clsx(styles.input, errors.username && styles.inputError)}
            placeholder="管理员用户名"
            autoComplete="username"
            {...register('username')}
          />
        </div>
        {errors.username ? (
          <span className={styles.fieldError}>{errors.username.message}</span>
        ) : null}
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="setup-displayname">
          显示名称（可选）
        </label>
        <div className={styles.inputWrapper}>
          <input
            id="setup-displayname"
            className={styles.input}
            placeholder="显示名称"
            autoComplete="name"
            {...register('displayName')}
          />
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="setup-password">
          密码
        </label>
        <div className={styles.inputWrapper}>
          <input
            id="setup-password"
            type={showPassword ? 'text' : 'password'}
            className={clsx(
              styles.input,
              styles.inputHasToggle,
              errors.password && styles.inputError,
            )}
            placeholder="至少 8 个字符"
            autoComplete="new-password"
            {...register('password')}
          />
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? '隐藏密码' : '显示密码'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password ? (
          <span className={styles.fieldError}>{errors.password.message}</span>
        ) : null}
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="setup-confirm-password">
          确认密码
        </label>
        <div className={styles.inputWrapper}>
          <input
            id="setup-confirm-password"
            type={showConfirm ? 'text' : 'password'}
            className={clsx(
              styles.input,
              styles.inputHasToggle,
              errors.confirmPassword && styles.inputError,
            )}
            placeholder="再次输入密码"
            autoComplete="new-password"
            {...register('confirmPassword')}
          />
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowConfirm((prev) => !prev)}
            aria-label={showConfirm ? '隐藏密码' : '显示密码'}
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.confirmPassword ? (
          <span className={styles.fieldError}>
            {errors.confirmPassword.message}
          </span>
        ) : null}
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? (
          <>
            <Loader2 size={18} className={styles.spinner} />
            创建中…
          </>
        ) : (
          '创建管理员'
        )}
      </button>
    </form>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useSession();
  const [mode, setMode] = useState<EntryMode>('login');
  const [registrationNotice, setRegistrationNotice] = useState<string | null>(
    null,
  );

  const entryQuery = useQuery({
    queryKey: queryKeys.auth.setupStatus(),
    queryFn: () => authApi.getSetupStatus(),
    retry: 2,
  });

  const needsSetup = entryQuery.data?.needs_setup ?? false;
  const registrationEnabled =
    !needsSetup && (entryQuery.data?.registration_enabled ?? false);

  useEffect(() => {
    if (!registrationEnabled && mode === 'register') {
      setMode('login');
    }
  }, [mode, registrationEnabled]);

  function handleAuthenticated(user: User) {
    login(user);
    const from = getSafeRedirectPath(searchParams.get('from'));
    navigate(from, { replace: true });
  }

  function handlePendingApproval(message: string) {
    setRegistrationNotice(message);
    setMode('login');
  }

  function handleSwitchMode(nextMode: EntryMode) {
    setRegistrationNotice(null);
    setMode(nextMode);
  }

  if (entryQuery.isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.brand}>FMBY</h1>
          <div className={styles.loading}>
            <Loader2 size={32} className={styles.spinner} />
          </div>
        </div>
      </div>
    );
  }

  if (entryQuery.isError) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.brand}>FMBY</h1>
          <div className={styles.retryContainer}>
            <div className={styles.errorBanner} role="alert">
              无法连接到服务器，请检查网络连接
            </div>
            <button
              className={styles.submitButton}
              onClick={() => entryQuery.refetch()}
            >
              重试
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.brand}>FMBY</h1>
        <p className={styles.subtitle}>
          {needsSetup
            ? '创建管理员账户以开始使用'
            : mode === 'register'
              ? '输入有效注册码，完成账号创建并接入默认权限'
              : registrationEnabled
                ? '使用已有账号登录，或切换到注册码注册'
                : '登录以继续'}
        </p>

        {registrationNotice ? (
          <div className={styles.successBanner} role="status">
            {registrationNotice}
          </div>
        ) : null}

        {!needsSetup && registrationEnabled ? (
          <div className={styles.modeSwitch} aria-label="认证入口模式切换">
            <button
              type="button"
              className={clsx(
                styles.modeButton,
                mode === 'login' && styles.modeButtonActive,
              )}
              onClick={() => handleSwitchMode('login')}
            >
              账号登录
            </button>
            <button
              type="button"
              className={clsx(
                styles.modeButton,
                mode === 'register' && styles.modeButtonActive,
              )}
              onClick={() => handleSwitchMode('register')}
            >
              注册码注册
            </button>
          </div>
        ) : null}

        {needsSetup ? (
          <SetupForm onAuthenticated={handleAuthenticated} />
        ) : mode === 'register' && registrationEnabled ? (
          <RegisterForm
            onAuthenticated={handleAuthenticated}
            onPendingApproval={handlePendingApproval}
          />
        ) : (
          <LoginForm onAuthenticated={handleAuthenticated} />
        )}
      </div>
    </div>
  );
}

function getSafeRedirectPath(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/';
  }
  return value;
}
