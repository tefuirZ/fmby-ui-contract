import { InlineBanner } from '@/shared/ui/common/InlineBanner';
import { FeedbackState } from '@/shared/ui/common/FeedbackState';
import { settingsApi, type ServerGeneralSettings } from '@/domains/settings';
import { queryKeys } from '@/shared/query-keys';
import styles from './SettingsCenter.module.css';
import {
  SettingsPageHeader,
  SettingsSectionCard,
  StickySaveBar,
  useEditableSettings,
} from './components';
import { getErrorMessage } from '@/shared/utils/error';

export function ServerGeneralSettingsPage() {
  const settings = useEditableSettings<ServerGeneralSettings>({
    queryKey: queryKeys.settings.server.general(),
    load: () => settingsApi.getServerGeneral(),
    save: (draft) => settingsApi.saveServerGeneral(draft),
    successMessage: '站点常规设置已保存。',
  });

  if (settings.query.isPending || !settings.draft) {
    return (
      <FeedbackState
        variant="loading"
        title="正在加载站点常规设置"
        description="正在同步站点名称、注册开关和公共文案。"
      />
    );
  }

  if (settings.query.isError) {
    return (
      <FeedbackState
        variant="error"
        title="站点常规设置加载失败"
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
        title="站点常规"
        description="管理员低频修改的站点级配置，保持在设置中心而不是工作台。"
      />

      <InlineBanner
        variant="success"
        title="公开注册开关现在会直接影响登录页的注册码注册入口。"
        description="关闭后访客只能使用已有账号登录；开启后，用户可通过有效注册码完成注册，审批型注册码会进入待激活状态。"
      />

      {settings.success ? (
        <InlineBanner
          variant="success"
          title={settings.success}
          description="站点配置已保存；各字段会按当前已经接入的消费端逐步生效。"
        />
      ) : null}

      {settings.mutation.isError ? (
        <InlineBanner
          variant="error"
          title="保存站点常规设置失败"
          description={getErrorMessage(settings.mutation.error)}
        />
      ) : null}

      <SettingsSectionCard title="站点信息" description="对外展示的基础信息。">
        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            站点名称
            <input
              className={styles.input}
              value={draft.siteName}
              onChange={(event) => {
                settings.setSuccess(null);
                settings.setDraft({ ...draft, siteName: event.target.value });
              }}
            />
          </label>
          <label className={styles.field}>
            支持联系方式
            <input
              className={styles.input}
              value={draft.supportContact}
              onChange={(event) => {
                settings.setSuccess(null);
                settings.setDraft({ ...draft, supportContact: event.target.value });
              }}
            />
          </label>
          <label className={`${styles.field} ${styles.fieldSpan}`}>
            首页公共文案
            <textarea
              className={styles.textarea}
              value={draft.publicHomepageMessage}
              onChange={(event) => {
                settings.setSuccess(null);
                settings.setDraft({ ...draft, publicHomepageMessage: event.target.value });
              }}
            />
          </label>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard title="注册与公告" description="控制用户入口和维护提示。">
        <div className={styles.compactList}>
          <label className={styles.switchRow}>
            <input
              className={styles.checkbox}
              type="checkbox"
              checked={draft.allowRegistration}
              onChange={(event) => {
                settings.setSuccess(null);
                settings.setDraft({ ...draft, allowRegistration: event.target.checked });
              }}
            />
            <div className={styles.switchBody}>
              <strong>启用注册码注册入口</strong>
              <span className={styles.fieldHint}>开启后登录页会显示“注册码注册”；关闭后只保留已有账号登录与首次初始化入口。</span>
            </div>
          </label>
          <label className={styles.field}>
            维护横幅
            <textarea
              className={styles.textarea}
              value={draft.maintenanceBanner}
              onChange={(event) => {
                settings.setSuccess(null);
                settings.setDraft({ ...draft, maintenanceBanner: event.target.value });
              }}
              placeholder="可留空"
            />
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
