import { InlineBanner } from '@/shared/ui/common/InlineBanner';
import { FeedbackState } from '@/shared/ui/common/FeedbackState';
import { settingsApi, type UserProfileSettings } from '@/domains/settings';
import { queryKeys } from '@/shared/query-keys';
import styles from './SettingsCenter.module.css';
import {
  SettingsPageHeader,
  SettingsSectionCard,
  StickySaveBar,
  useEditableSettings,
} from './components';
import { getErrorMessage } from '@/shared/utils/error';

export function ProfileSettingsPage() {
  const settings = useEditableSettings<UserProfileSettings>({
    queryKey: queryKeys.settings.profile(),
    load: () => settingsApi.getUserProfile(),
    save: (draft) => settingsApi.saveUserProfile(draft),
    successMessage: '个人资料已保存。',
  });

  if (settings.query.isPending || !settings.draft) {
    return (
      <FeedbackState
        variant="loading"
        title="正在加载个人资料"
        description="正在同步昵称、头像和默认媒体库偏好。"
      />
    );
  }

  if (settings.query.isError) {
    return (
      <FeedbackState
        variant="error"
        title="个人资料加载失败"
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
        title="个人资料"
        description="管理个人基础信息、默认媒体库和对外展示内容。"
        meta="按当前分组单独保存。"
      />

      {settings.success ? (
        <InlineBanner variant="success" title={settings.success} description="修改已生效。" />
      ) : null}

      {settings.mutation.isError ? (
        <InlineBanner
          variant="error"
          title="保存个人资料失败"
          description={getErrorMessage(settings.mutation.error)}
        />
      ) : null}

      <SettingsSectionCard title="基础信息" description="这些信息会影响账号展示与默认进入体验。">
        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            用户名
            <input className={styles.input} value={draft.username} disabled />
            <span className={styles.fieldHint}>用户名由服务端维护，此处只读展示。</span>
          </label>
          <label className={styles.field}>
            显示名称
            <input
              className={styles.input}
              value={draft.displayName}
              onChange={(event) => {
                settings.setSuccess(null);
                settings.setDraft({ ...draft, displayName: event.target.value });
              }}
            />
          </label>
          <label className={styles.field}>
            头像链接
            <input
              className={styles.input}
              value={draft.avatarUrl}
              onChange={(event) => {
                settings.setSuccess(null);
                settings.setDraft({ ...draft, avatarUrl: event.target.value });
              }}
              placeholder="https://example.com/avatar.png"
            />
          </label>
          <label className={styles.field}>
            默认媒体库
            <select
              className={styles.select}
              value={draft.defaultLibraryId}
              onChange={(event) => {
                settings.setSuccess(null);
                settings.setDraft({ ...draft, defaultLibraryId: event.target.value });
              }}
            >
              <option value="">不指定</option>
              {draft.availableLibraries.map((library) => (
                <option key={library.value} value={library.value}>
                  {library.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard title="联系与简介" description="用于账号页和系统内展示。">
        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            邮箱
            <input
              className={styles.input}
              value={draft.email}
              onChange={(event) => {
                settings.setSuccess(null);
                settings.setDraft({ ...draft, email: event.target.value });
              }}
            />
          </label>
          <label className={`${styles.field} ${styles.fieldSpan}`}>
            简介
            <textarea
              className={styles.textarea}
              value={draft.bio}
              onChange={(event) => {
                settings.setSuccess(null);
                settings.setDraft({ ...draft, bio: event.target.value });
              }}
            />
          </label>
        </div>
      </SettingsSectionCard>

      {draft.currentPasswordRequired ? (
        <SettingsSectionCard
          title="安全确认"
          description="当前站点策略要求修改个人资料时校验一次当前密码。"
        >
          <div className={styles.fieldGrid}>
            <label className={styles.field}>
              当前密码
              <input
                className={styles.input}
                type="password"
                value={draft.currentPassword}
                onChange={(event) => {
                  settings.setSuccess(null);
                  settings.setDraft({ ...draft, currentPassword: event.target.value });
                }}
                placeholder="保存资料前输入当前密码"
                autoComplete="current-password"
              />
              <span className={styles.fieldHint}>只在本次保存时使用，保存成功后会自动清空。</span>
            </label>
          </div>
        </SettingsSectionCard>
      ) : null}

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
