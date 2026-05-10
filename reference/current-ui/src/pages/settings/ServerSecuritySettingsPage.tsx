import { InlineBanner } from '@/shared/ui/common/InlineBanner';
import { FeedbackState } from '@/shared/ui/common/FeedbackState';
import { settingsApi, type ServerSecuritySettings } from '@/domains/settings';
import { queryKeys } from '@/shared/query-keys';
import styles from './SettingsCenter.module.css';
import {
  SettingsPageHeader,
  SettingsSectionCard,
  StickySaveBar,
  useEditableSettings,
} from './components';
import { getErrorMessage } from '@/shared/utils/error';

function minutesFromSeconds(value: number) {
  return Math.max(1, Math.round(value / 60));
}

function secondsFromMinutes(value: number, fallbackMinutes: number) {
  return Math.max(1, Number(value) || fallbackMinutes) * 60;
}

export function ServerSecuritySettingsPage() {
  const settings = useEditableSettings<ServerSecuritySettings>({
    queryKey: queryKeys.settings.server.security(),
    load: () => settingsApi.getServerSecurity(),
    save: (draft) => settingsApi.saveServerSecurity(draft),
    successMessage: '安全策略已保存。',
  });

  if (settings.query.isPending || !settings.draft) {
    return (
      <FeedbackState
        variant="loading"
        title="正在加载安全策略"
        description="正在同步登录策略、失败登录保护和敏感操作确认规则。"
      />
    );
  }

  if (settings.query.isError) {
    return (
      <FeedbackState
        variant="error"
        title="安全策略加载失败"
        description={getErrorMessage(settings.query.error)}
        action={
          <button className={styles.primaryButton} onClick={() => settings.query.refetch()}>
            重试
          </button>
        }
      />
    );
  }

  const draft = settings.draft;

  return (
    <div className={styles.pageSections}>
      <SettingsPageHeader
        title="安全策略"
        description="聚焦登录方式、失败登录保护和敏感操作确认，不越界成完整后台。"
      />

      <InlineBanner
        variant="warning"
        title="当前剩余未闭环的安全策略主要是 OTP 登录模式。"
        description="登录限流、失败锁定和敏感操作确认已经接到运行时；`password+otp` 仍是预留能力，当前界面不再允许新启用。"
      />

      {settings.success ? (
        <InlineBanner
          variant="success"
          title={settings.success}
          description="策略已写入配置中心；当前仍未闭环的主要高优先级项是 OTP 登录模式。"
        />
      ) : null}

      {settings.mutation.isError ? (
        <InlineBanner
          variant="error"
          title="保存安全策略失败"
          description={getErrorMessage(settings.mutation.error)}
        />
      ) : null}

      <SettingsSectionCard title="登录策略" description="控制登录时的认证强度和失败保护。">
        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            登录模式
            <select
              className={styles.select}
              value={draft.loginMode}
              onChange={(event) => {
                settings.setSuccess(null);
                settings.setDraft({
                  ...draft,
                  loginMode: event.target.value as ServerSecuritySettings['loginMode'],
                });
              }}
            >
              <option value="password">仅密码</option>
              <option value="password+otp" disabled>
                密码 + 二次校验（预留，暂未开放）
              </option>
            </select>
            <span className={styles.fieldHint}>
              {draft.loginMode === 'password+otp'
                ? '当前配置仍停在预留模式。请切回“仅密码”后保存，别让配置继续挂在半套状态。'
                : '真 OTP 还没补齐用户秘钥、验证码输入和验证链，当前版本先不允许从界面开启。'}
            </span>
          </label>
          <label className={styles.switchRow}>
            <input
              className={styles.checkbox}
              type="checkbox"
              checked={draft.loginRateLimitEnabled}
              onChange={(event) => {
                settings.setSuccess(null);
                settings.setDraft({
                  ...draft,
                  loginRateLimitEnabled: event.target.checked,
                });
              }}
            />
            <div className={styles.switchBody}>
              <strong>启用登录限流</strong>
              <span className={styles.fieldHint}>保存完整契约，避免未暴露字段被前端默认值污染。</span>
            </div>
          </label>
          <label className={styles.field}>
            限流窗口内最大尝试次数
            <input
              className={styles.input}
              type="number"
              min={1}
              disabled={!draft.loginRateLimitEnabled}
              value={draft.loginRateLimitMaxAttempts}
              onChange={(event) => {
                settings.setSuccess(null);
                settings.setDraft({
                  ...draft,
                  loginRateLimitMaxAttempts: Number(event.target.value) || 1,
                });
              }}
            />
          </label>
          <label className={styles.field}>
            限流窗口（分钟）
            <input
              className={styles.input}
              type="number"
              min={1}
              disabled={!draft.loginRateLimitEnabled}
              value={minutesFromSeconds(draft.loginRateLimitWindowSeconds)}
              onChange={(event) => {
                settings.setSuccess(null);
                settings.setDraft({
                  ...draft,
                  loginRateLimitWindowSeconds: secondsFromMinutes(
                    Number(event.target.value),
                    15,
                  ),
                });
              }}
            />
          </label>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard title="失败登录保护" description="对连续失败登录进行锁定控制。">
        <div className={styles.fieldGrid}>
          <label className={styles.switchRow}>
            <input
              className={styles.checkbox}
              type="checkbox"
              checked={draft.failedLoginLockoutEnabled}
              onChange={(event) => {
                settings.setSuccess(null);
                settings.setDraft({
                  ...draft,
                  failedLoginLockoutEnabled: event.target.checked,
                });
              }}
            />
            <div className={styles.switchBody}>
              <strong>启用失败登录锁定</strong>
              <span className={styles.fieldHint}>锁定阈值和锁定时长将按完整契约透传保存。</span>
            </div>
          </label>
          <label className={styles.field}>
            锁定阈值（次）
            <input
              className={styles.input}
              type="number"
              min={1}
              disabled={!draft.failedLoginLockoutEnabled}
              value={draft.failedLoginLockoutThreshold}
              onChange={(event) => {
                settings.setSuccess(null);
                settings.setDraft({
                  ...draft,
                  failedLoginLockoutThreshold: Number(event.target.value) || 1,
                });
              }}
            />
          </label>
          <label className={styles.field}>
            锁定时长（分钟）
            <input
              className={styles.input}
              type="number"
              min={1}
              disabled={!draft.failedLoginLockoutEnabled}
              value={minutesFromSeconds(draft.failedLoginLockoutSeconds)}
              onChange={(event) => {
                settings.setSuccess(null);
                settings.setDraft({
                  ...draft,
                  failedLoginLockoutSeconds: secondsFromMinutes(
                    Number(event.target.value),
                    15,
                  ),
                });
              }}
            />
          </label>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard title="敏感操作确认" description="对高风险操作追加二次确认。">
        <div className={styles.compactList}>
          <label className={styles.field}>
            确认方式
            <select
              className={styles.select}
              value={draft.sensitiveActionConfirmation}
              onChange={(event) => {
                settings.setSuccess(null);
                settings.setDraft({
                  ...draft,
                  sensitiveActionConfirmation:
                    event.target.value as ServerSecuritySettings['sensitiveActionConfirmation'],
                });
              }}
            >
              <option value="none">不额外确认</option>
              <option value="session">当前会话确认</option>
              <option value="password">重新输入密码</option>
            </select>
          </label>
          <label className={styles.switchRow}>
            <input
              className={styles.checkbox}
              type="checkbox"
              checked={draft.requireCurrentPasswordForProfileChange}
              onChange={(event) => {
                settings.setSuccess(null);
                settings.setDraft({
                  ...draft,
                  requireCurrentPasswordForProfileChange: event.target.checked,
                });
              }}
            />
            <div className={styles.switchBody}>
              <strong>修改个人资料时要求当前密码</strong>
              <span className={styles.fieldHint}>减少账号被接管后的静默篡改风险。</span>
            </div>
          </label>
        </div>
      </SettingsSectionCard>

      <StickySaveBar
        dirty={settings.isDirty}
        pending={settings.mutation.isPending}
        success={settings.success}
        onReset={() => settings.reset()}
        onSave={() => settings.save()}
      />
    </div>
  );
}
