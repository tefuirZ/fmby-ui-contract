import { useState } from 'react';
import { InlineBanner } from '@/shared/ui/common/InlineBanner';
import { FeedbackState } from '@/shared/ui/common/FeedbackState';
import { settingsApi, type UserPlaybackSettings } from '@/domains/settings';
import { resolvePlayerEngineId, setPlayerEngineId, type PlayerEngineId } from '@/features/player';
import { queryKeys } from '@/shared/query-keys';
import styles from './SettingsCenter.module.css';
import {
  SettingsPageHeader,
  SettingsSectionCard,
  StickySaveBar,
  useEditableSettings,
} from './components';
import { getErrorMessage } from '@/shared/utils/error';

export function PlaybackSettingsPage() {
  const [playerEngine, setPlayerEngine] = useState<PlayerEngineId>(() => resolvePlayerEngineId());
  const settings = useEditableSettings<UserPlaybackSettings>({
    queryKey: queryKeys.settings.playback(),
    load: () => settingsApi.getUserPlayback(),
    save: (draft) => settingsApi.saveUserPlayback(draft),
    successMessage: '播放偏好已保存。',
  });

  if (settings.query.isPending || !settings.draft) {
    return (
      <FeedbackState
        variant="loading"
        title="正在加载播放偏好"
        description="正在同步字幕、音轨和继续播放相关设置。"
      />
    );
  }

  if (settings.query.isError) {
    return (
      <FeedbackState
        variant="error"
        title="播放偏好加载失败"
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
  const handlePlayerEngineChange = (engineId: PlayerEngineId) => {
    setPlayerEngine(engineId);
    setPlayerEngineId(engineId);
  };

  return (
    <div className={styles.pageSections}>
      <SettingsPageHeader
        title="播放偏好"
        description="控制字幕、音轨和继续播放行为，不把播放器细节塞进管理中心。"
      />

      {settings.success ? (
        <InlineBanner variant="success" title={settings.success} description="下次播放将按新偏好执行。" />
      ) : null}

      {settings.mutation.isError ? (
        <InlineBanner
          variant="error"
          title="保存播放偏好失败"
          description={getErrorMessage(settings.mutation.error)}
        />
      ) : null}

      <SettingsSectionCard title="默认轨道" description="优先设置你的字幕和音轨偏好。">
        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            默认字幕语言
            <select
              className={styles.select}
              value={draft.subtitleLanguage}
              onChange={(event) => {
                settings.setSuccess(null);
                settings.setDraft({ ...draft, subtitleLanguage: event.target.value });
              }}
            >
              {draft.availableLanguages.map((language) => (
                <option key={language.value} value={language.value}>
                  {language.label}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            默认音轨语言
            <select
              className={styles.select}
              value={draft.audioLanguage}
              onChange={(event) => {
                settings.setSuccess(null);
                settings.setDraft({ ...draft, audioLanguage: event.target.value });
              }}
            >
              {draft.availableLanguages.map((language) => (
                <option key={language.value} value={language.value}>
                  {language.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard title="继续播放与外部播放器" description="这些偏好会影响回放恢复体验。">
        <div className={styles.compactList}>
          <label className={styles.switchRow}>
            <input
              className={styles.checkbox}
              type="checkbox"
              checked={draft.resumePlayback}
              onChange={(event) => {
                settings.setSuccess(null);
                settings.setDraft({ ...draft, resumePlayback: event.target.checked });
              }}
            />
            <div className={styles.switchBody}>
              <strong>自动恢复播放</strong>
              <span className={styles.fieldHint}>下次打开同一内容时从上次进度继续。</span>
            </div>
          </label>
          <label className={styles.switchRow}>
            <input
              className={styles.checkbox}
              type="checkbox"
              checked={draft.autoplayNextEpisode}
              onChange={(event) => {
                settings.setSuccess(null);
                settings.setDraft({ ...draft, autoplayNextEpisode: event.target.checked });
              }}
            />
            <div className={styles.switchBody}>
              <strong>自动播放下一集</strong>
              <span className={styles.fieldHint}>剧集结束后自动衔接下一集。</span>
            </div>
          </label>
          <label className={styles.switchRow}>
            <input
              className={styles.checkbox}
              type="checkbox"
              checked={draft.preferExternalPlayer}
              onChange={(event) => {
                settings.setSuccess(null);
                settings.setDraft({ ...draft, preferExternalPlayer: event.target.checked });
              }}
            />
            <div className={styles.switchBody}>
              <strong>优先外部播放器</strong>
              <span className={styles.fieldHint}>在支持时优先跳转系统播放器。</span>
            </div>
          </label>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard title="网页播放器内核" description="这是本机实验开关，立即影响当前浏览器，不改后端媒体链路。">
        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            播放器引擎
            <select
              className={styles.select}
              value={playerEngine}
              onChange={(event) => handlePlayerEngineChange(event.target.value as PlayerEngineId)}
            >
              <option value="dplayer">DPlayer（稳定回退）</option>
              <option value="artplayer">ArtPlayer（实验）</option>
            </select>
          </label>
          <div className={styles.field}>
            当前策略
            <span className={styles.fieldHint}>
              {playerEngine === 'artplayer'
                ? '已在本机启用 ArtPlayer。若遇到格式兼容问题，可随时切回 DPlayer 或使用外部播放器。'
                : '当前使用 DPlayer，ArtPlayer 可作为实验内核灰度启用。'}
            </span>
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
