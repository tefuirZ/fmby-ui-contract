import { InlineBanner } from '@/shared/ui/common/InlineBanner';
import { FeedbackState } from '@/shared/ui/common/FeedbackState';
import { settingsApi, type UserAppearanceSettings } from '@/domains/settings';
import { queryKeys } from '@/shared/query-keys';
import styles from './SettingsCenter.module.css';
import {
  SettingsPageHeader,
  SettingsSectionCard,
  StickySaveBar,
  useEditableSettings,
} from './components';
import { getErrorMessage } from '@/shared/utils/error';

export function AppearanceSettingsPage() {
  const settings = useEditableSettings<UserAppearanceSettings>({
    queryKey: queryKeys.settings.appearance(),
    load: () => settingsApi.getUserAppearance(),
    save: (draft) => settingsApi.saveUserAppearance(draft),
    successMessage: '外观设置已保存。',
  });

  if (settings.query.isPending || !settings.draft) {
    return (
      <FeedbackState
        variant="loading"
        title="正在加载外观设置"
        description="正在同步主题、海报密度和动效偏好。"
      />
    );
  }

  if (settings.query.isError) {
    return (
      <FeedbackState
        variant="error"
        title="外观设置加载失败"
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
        title="外观"
        description="统一控制主题、浏览密度和动效偏好，兼顾桌面端与移动端。"
      />

      {settings.success ? (
        <InlineBanner variant="success" title={settings.success} description="界面偏好已更新。" />
      ) : null}

      {settings.mutation.isError ? (
        <InlineBanner
          variant="error"
          title="保存外观设置失败"
          description={getErrorMessage(settings.mutation.error)}
        />
      ) : null}

      <SettingsSectionCard title="视觉模式" description="主题与信息密度直接影响浏览体验。">
        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            主题
            <select
              className={styles.select}
              value={draft.theme}
              onChange={(event) => {
                settings.setSuccess(null);
                settings.setDraft({
                  ...draft,
                  theme: event.target.value as UserAppearanceSettings['theme'],
                });
              }}
            >
              <option value="system">跟随系统</option>
              <option value="dark">深色</option>
              <option value="light">浅色</option>
            </select>
          </label>
          <label className={styles.field}>
            海报密度
            <select
              className={styles.select}
              value={draft.posterDensity}
              onChange={(event) => {
                settings.setSuccess(null);
                settings.setDraft({
                  ...draft,
                  posterDensity: event.target.value as UserAppearanceSettings['posterDensity'],
                });
              }}
            >
              <option value="comfortable">舒适</option>
              <option value="compact">紧凑</option>
            </select>
          </label>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard title="动效与首页模块" description="支持减少动效和模块级显隐。">
        <div className={styles.compactList}>
          <label className={styles.switchRow}>
            <input
              className={styles.checkbox}
              type="checkbox"
              checked={draft.reducedMotion}
              onChange={(event) => {
                settings.setSuccess(null);
                settings.setDraft({ ...draft, reducedMotion: event.target.checked });
              }}
            />
            <div className={styles.switchBody}>
              <strong>减少动效</strong>
              <span className={styles.fieldHint}>降低页面切换与组件微动效。</span>
            </div>
          </label>

          <div className={styles.compactList}>
            {draft.homeSections.map((section) => (
              <label className={styles.reorderRow} key={section.id}>
                <div className={styles.switchBody}>
                  <strong>{section.label}</strong>
                  <span className={styles.fieldHint}>控制首页模块是否显示。</span>
                </div>
                <input
                  className={styles.checkbox}
                  type="checkbox"
                  checked={section.enabled}
                  onChange={(event) => {
                    settings.setSuccess(null);
                    settings.setDraft({
                      ...draft,
                      homeSections: draft.homeSections.map((item) =>
                        item.id === section.id
                          ? { ...item, enabled: event.target.checked }
                          : item,
                      ),
                    });
                  }}
                />
              </label>
            ))}
          </div>
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
