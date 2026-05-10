import type { Dispatch, SetStateAction } from 'react';
import type { ServerSecuritySettings } from '@/domains/settings';
import type { SiteSettingsDraft } from '../types';
import { minutesFromSeconds, secondsFromMinutes } from '../formUtils';
import { ManageSectionCard } from '../../components';
import styles from '../../ManagePages.module.css';

interface SiteSettingsSecuritySectionProps {
  draft: SiteSettingsDraft;
  setDraft: Dispatch<SetStateAction<SiteSettingsDraft | null>>;
  setSuccess: Dispatch<SetStateAction<string | null>>;
}

export function SiteSettingsSecuritySection({
  draft,
  setDraft,
  setSuccess,
}: SiteSettingsSecuritySectionProps) {
  return (
    <ManageSectionCard
      title="登录安全"
      description="先把登录入口守住，别让限流、锁定和敏感操作散在三四个页面里。"
    >
      <div id="site-security" className={styles.fieldGroup}>
        <div className={styles.fieldRow}>
          <label className={styles.label}>
            登录模式
            <select
              className={styles.select}
              value={draft.security.loginMode}
              onChange={(event) => {
                setSuccess(null);
                setDraft((current) =>
                  current
                    ? {
                        ...current,
                        security: {
                          ...current.security,
                          loginMode: event.target.value as ServerSecuritySettings['loginMode'],
                        },
                      }
                    : current,
                );
              }}
            >
              <option value="password">仅密码</option>
              <option value="password+otp" disabled>
                密码 + 二次校验（暂未开放）
              </option>
            </select>
            <span className={styles.fieldHint}>
              当前版本先只推荐"仅密码"，双重验证还没完整接完。
            </span>
          </label>
          <label className={styles.label}>
            危险操作确认
            <select
              className={styles.select}
              value={draft.security.sensitiveActionConfirmation}
              onChange={(event) => {
                setSuccess(null);
                setDraft((current) =>
                  current
                    ? {
                        ...current,
                        security: {
                          ...current.security,
                          sensitiveActionConfirmation:
                            event.target
                              .value as ServerSecuritySettings['sensitiveActionConfirmation'],
                        },
                      }
                    : current,
                );
              }}
            >
              <option value="none">不额外确认</option>
              <option value="session">确认当前会话</option>
              <option value="password">重新输入密码</option>
            </select>
            <span className={styles.fieldHint}>
              推荐至少保留会话确认，别让误删一路点到底。
            </span>
          </label>
        </div>

        <label className={styles.checkboxRow}>
          <input
            className={styles.checkbox}
            type="checkbox"
            checked={draft.security.loginRateLimitEnabled}
            onChange={(event) => {
              setSuccess(null);
              setDraft((current) =>
                current
                  ? {
                      ...current,
                      security: {
                        ...current.security,
                        loginRateLimitEnabled: event.target.checked,
                      },
                    }
                  : current,
              );
            }}
          />
          <div className={styles.stackText}>
            <strong>限制短时间内的重复登录尝试</strong>
            <span className={styles.mutedText}>
              开启后，密码被暴力尝试时更容易挡住。
            </span>
          </div>
        </label>
        <div className={styles.fieldRow}>
          <label className={styles.label}>
            限流次数
            <input
              className={styles.input}
              type="number"
              min={1}
              disabled={!draft.security.loginRateLimitEnabled}
              value={draft.security.loginRateLimitMaxAttempts}
              onChange={(event) => {
                setSuccess(null);
                setDraft((current) =>
                  current
                    ? {
                        ...current,
                        security: {
                          ...current.security,
                          loginRateLimitMaxAttempts: Number(event.target.value) || 1,
                        },
                      }
                    : current,
                );
              }}
            />
          </label>
          <label className={styles.label}>
            限流窗口（分钟）
            <input
              className={styles.input}
              type="number"
              min={1}
              disabled={!draft.security.loginRateLimitEnabled}
              value={minutesFromSeconds(draft.security.loginRateLimitWindowSeconds)}
              onChange={(event) => {
                setSuccess(null);
                setDraft((current) =>
                  current
                    ? {
                        ...current,
                        security: {
                          ...current.security,
                          loginRateLimitWindowSeconds: secondsFromMinutes(
                            Number(event.target.value),
                            15,
                          ),
                        },
                      }
                    : current,
                );
              }}
            />
          </label>
        </div>

        <label className={styles.checkboxRow}>
          <input
            className={styles.checkbox}
            type="checkbox"
            checked={draft.security.failedLoginLockoutEnabled}
            onChange={(event) => {
              setSuccess(null);
              setDraft((current) =>
                current
                  ? {
                      ...current,
                      security: {
                        ...current.security,
                        failedLoginLockoutEnabled: event.target.checked,
                      },
                    }
                  : current,
              );
            }}
          />
          <div className={styles.stackText}>
            <strong>连续输错密码时临时锁定</strong>
            <span className={styles.mutedText}>
              适合挡住反复试密码，也能提醒用户停一停。
            </span>
          </div>
        </label>
        <div className={styles.fieldRow}>
          <label className={styles.label}>
            锁定阈值（次）
            <input
              className={styles.input}
              type="number"
              min={1}
              disabled={!draft.security.failedLoginLockoutEnabled}
              value={draft.security.failedLoginLockoutThreshold}
              onChange={(event) => {
                setSuccess(null);
                setDraft((current) =>
                  current
                    ? {
                        ...current,
                        security: {
                          ...current.security,
                          failedLoginLockoutThreshold: Number(event.target.value) || 1,
                        },
                      }
                    : current,
                );
              }}
            />
          </label>
          <label className={styles.label}>
            锁定时长（分钟）
            <input
              className={styles.input}
              type="number"
              min={1}
              disabled={!draft.security.failedLoginLockoutEnabled}
              value={minutesFromSeconds(draft.security.failedLoginLockoutSeconds)}
              onChange={(event) => {
                setSuccess(null);
                setDraft((current) =>
                  current
                    ? {
                        ...current,
                        security: {
                          ...current.security,
                          failedLoginLockoutSeconds: secondsFromMinutes(
                            Number(event.target.value),
                            15,
                          ),
                        },
                      }
                    : current,
                );
              }}
            />
          </label>
        </div>

        <label className={styles.checkboxRow}>
          <input
            className={styles.checkbox}
            type="checkbox"
            checked={draft.security.requireCurrentPasswordForProfileChange}
            onChange={(event) => {
              setSuccess(null);
              setDraft((current) =>
                current
                  ? {
                      ...current,
                      security: {
                        ...current.security,
                        requireCurrentPasswordForProfileChange: event.target.checked,
                      },
                    }
                  : current,
              );
            }}
          />
          <div className={styles.stackText}>
            <strong>修改个人资料时要求当前密码</strong>
            <span className={styles.mutedText}>
              能减少账号被接管后被静默改资料的风险。
            </span>
          </div>
        </label>
      </div>
    </ManageSectionCard>
  );
}
