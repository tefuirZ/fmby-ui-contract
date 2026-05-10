import { InlineBanner } from '@/shared/ui/common/InlineBanner';
import { FeedbackState } from '@/shared/ui/common/FeedbackState';
import { settingsApi, type ServerSessionPolicySettings } from '@/domains/settings';
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

export function ServerSessionPolicySettingsPage() {
  const settings = useEditableSettings<ServerSessionPolicySettings>({
    queryKey: queryKeys.settings.server.sessionPolicy(),
    load: () => settingsApi.getServerSessionPolicy(),
    save: (draft) => settingsApi.saveServerSessionPolicy(draft),
    successMessage: '会话策略已保存。',
  });

  if (settings.query.isPending || !settings.draft) {
    return (
      <FeedbackState
        variant="loading"
        title="正在加载会话策略"
        description="正在同步用户 TTL、管理员 TTL 和令牌派生策略。"
      />
    );
  }

  if (settings.query.isError) {
    return (
      <FeedbackState
        variant="error"
        title="会话策略加载失败"
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
        title="会话策略"
        description="区分普通用户与管理员会话寿命，并明确令牌轮换策略。"
      />

      <InlineBanner
        variant="warning"
        title="当前页先收口完整会话契约，避免保存时丢字段或直接撞 400。"
        description="令牌轮换开关、兼容回退开关等字段会随配置一起保存；实际运行时消费范围以后端当前实现为准。"
      />

      {settings.success ? (
        <InlineBanner
          variant="success"
          title={settings.success}
          description="配置已写入会话策略中心；具体生效范围以当前认证与兼容层已接入能力为准。"
        />
      ) : null}

      {settings.mutation.isError ? (
        <InlineBanner
          variant="error"
          title="保存会话策略失败"
          description={getErrorMessage(settings.mutation.error)}
        />
      ) : null}

      <SettingsSectionCard title="会话时长" description="高权限账号可使用更严格的生命周期。">
        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            用户会话 TTL（分钟）
            <input
              className={styles.input}
              type="number"
              min={30}
              value={minutesFromSeconds(draft.userSessionTtlSeconds)}
              onChange={(event) => {
                settings.setSuccess(null);
                settings.setDraft({
                  ...draft,
                  userSessionTtlSeconds: secondsFromMinutes(
                    Number(event.target.value),
                    30,
                  ),
                });
              }}
            />
          </label>
          <label className={styles.field}>
            管理员会话 TTL（分钟）
            <input
              className={styles.input}
              type="number"
              min={15}
              value={minutesFromSeconds(draft.adminSessionTtlSeconds)}
              onChange={(event) => {
                settings.setSuccess(null);
                settings.setDraft({
                  ...draft,
                  adminSessionTtlSeconds: secondsFromMinutes(
                    Number(event.target.value),
                    15,
                  ),
                });
              }}
            />
          </label>
          <label className={styles.field}>
            记住登录天数
            <input
              className={styles.input}
              type="number"
              min={1}
              value={draft.rememberMeTtlDays}
              onChange={(event) => {
                settings.setSuccess(null);
                settings.setDraft({
                  ...draft,
                  rememberMeTtlDays: Number(event.target.value) || 1,
                });
              }}
            />
          </label>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard title="令牌策略" description="控制轮换时机和管理员并发会话。">
        <div className={styles.compactList}>
          <label className={styles.switchRow}>
            <input
              className={styles.checkbox}
              type="checkbox"
              checked={draft.tokenRotationEnabled}
              onChange={(event) => {
                settings.setSuccess(null);
                settings.setDraft({
                  ...draft,
                  tokenRotationEnabled: event.target.checked,
                });
              }}
            />
            <div className={styles.switchBody}>
              <strong>启用令牌轮换</strong>
              <span className={styles.fieldHint}>关闭后仍会保留轮换策略字段，避免后端契约被前端截断。</span>
            </div>
          </label>
          <label className={styles.field}>
            令牌轮换策略
            <select
              className={styles.select}
              disabled={!draft.tokenRotationEnabled}
              value={draft.tokenRotationPolicy}
              onChange={(event) => {
                settings.setSuccess(null);
                settings.setDraft({
                  ...draft,
                  tokenRotationPolicy:
                    event.target.value as ServerSessionPolicySettings['tokenRotationPolicy'],
                });
              }}
            >
              <option value="always">每次刷新都轮换</option>
              <option value="daily">每天轮换</option>
              <option value="risk-only">仅风险场景轮换</option>
            </select>
          </label>
          <label className={styles.switchRow}>
            <input
              className={styles.checkbox}
              type="checkbox"
              checked={draft.compatLegacySessionFallbackEnabled}
              onChange={(event) => {
                settings.setSuccess(null);
                settings.setDraft({
                  ...draft,
                  compatLegacySessionFallbackEnabled: event.target.checked,
                });
              }}
            />
            <div className={styles.switchBody}>
              <strong>兼容旧版会话回退</strong>
              <span className={styles.fieldHint}>兼容层需要完整收到这个字段，缺失时保存会直接撞后端契约校验。</span>
            </div>
          </label>
          <label className={styles.switchRow}>
            <input
              className={styles.checkbox}
              type="checkbox"
              checked={draft.singleSessionForAdmins}
              onChange={(event) => {
                settings.setSuccess(null);
                settings.setDraft({
                  ...draft,
                  singleSessionForAdmins: event.target.checked,
                });
              }}
            />
            <div className={styles.switchBody}>
              <strong>管理员仅允许单会话</strong>
              <span className={styles.fieldHint}>新登录会挤掉旧的管理员会话。</span>
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
