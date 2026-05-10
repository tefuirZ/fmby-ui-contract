import { Fragment } from 'react';
import { AlertCircle, Loader2, RefreshCcw, Sparkles } from 'lucide-react';

import type {
  ManageMediaItemIdentifyTaskRecord,
  ManageMediaItemIdentityBindingRecord,
  ManageMediaItemPipelineRecord,
  ManageMediaItemScrapeTaskRecord,
} from '@/domains/manage/media-items';
import {
  StatusBadge,
  type StatusBadgeVariant,
} from '@/shared/ui/common/StatusBadge';
import { formatDateTime, formatRelativeTime } from '@/shared/utils/date';

import sharedStyles from '../../ManagePages.module.css';
import styles from '../../ManageMediaItemDetailPage.module.css';
import { ManageSectionCard } from '../../components';

const ACTIVE_TASK_STATUSES = new Set(['Queued', 'Running', 'RetryWaiting']);

function mapTaskStatusVariant(status: string): StatusBadgeVariant {
  switch (status) {
    case 'Succeeded':
      return 'success';
    case 'Running':
      return 'info';
    case 'Queued':
    case 'RetryWaiting':
      return 'warning';
    case 'Failed':
    case 'Cancelled':
    case 'Expired':
      return 'danger';
    default:
      return 'neutral';
  }
}

function mapTaskStatusLabel(status: string): string {
  switch (status) {
    case 'Queued':
      return '排队中';
    case 'Running':
      return '运行中';
    case 'RetryWaiting':
      return '等待重试';
    case 'Succeeded':
      return '已完成';
    case 'Failed':
      return '已失败';
    case 'Cancelled':
      return '已取消';
    case 'Expired':
      return '已过期';
    default:
      return status || '未知';
  }
}

function mapBindingStateVariant(state: string): StatusBadgeVariant {
  switch (state) {
    case 'Active':
    case 'Locked':
      return 'success';
    case 'Pending':
      return 'warning';
    case 'Conflict':
    case 'Rejected':
      return 'danger';
    default:
      return 'neutral';
  }
}

function mapBindingStateLabel(state: string): string {
  switch (state) {
    case 'Active':
      return '已绑定';
    case 'Locked':
      return '已锁定';
    case 'Pending':
      return '识别中';
    case 'Conflict':
      return '冲突';
    case 'Rejected':
      return '已拒绝';
    default:
      return state || '未知';
  }
}

function shortFingerprint(fp: string): string {
  if (!fp) {
    return '—';
  }
  return fp.length > 12 ? `${fp.slice(0, 8)}…${fp.slice(-4)}` : fp;
}

function IdentifyTaskCard({ task }: { task: ManageMediaItemIdentifyTaskRecord }) {
  return (
    <article className={styles.valueCard}>
      <div className={styles.valueCardTitle}>识别任务</div>
      <dl className={styles.valueList}>
        <div className={styles.valueListRow}>
          <dt>状态</dt>
          <dd>
            <StatusBadge
              label={mapTaskStatusLabel(task.status)}
              variant={mapTaskStatusVariant(task.status)}
            />
          </dd>
        </div>
        <div className={styles.valueListRow}>
          <dt>尝试次数</dt>
          <dd>{task.attemptCount}</dd>
        </div>
        {task.requestReason ? (
          <div className={styles.valueListRow}>
            <dt>触发原因</dt>
            <dd>{task.requestReason}</dd>
          </div>
        ) : null}
        {task.nextRetryAt ? (
          <div className={styles.valueListRow}>
            <dt>下次重试</dt>
            <dd>
              {formatDateTime(task.nextRetryAt)}
              <span className={sharedStyles.mutedText}>
                {' '}
                ({formatRelativeTime(task.nextRetryAt)})
              </span>
            </dd>
          </div>
        ) : null}
        {task.lastError ? (
          <div className={styles.valueListRow}>
            <dt>上次错误</dt>
            <dd className={sharedStyles.mutedText}>{task.lastError}</dd>
          </div>
        ) : null}
        {task.updatedAt ? (
          <div className={styles.valueListRow}>
            <dt>更新时间</dt>
            <dd>{formatDateTime(task.updatedAt)}</dd>
          </div>
        ) : null}
      </dl>
    </article>
  );
}

function IdentityBindingCard({
  binding,
}: {
  binding: ManageMediaItemIdentityBindingRecord;
}) {
  return (
    <article className={styles.valueCard}>
      <div className={styles.valueCardTitle}>身份绑定</div>
      <dl className={styles.valueList}>
        <div className={styles.valueListRow}>
          <dt>状态</dt>
          <dd>
            <StatusBadge
              label={mapBindingStateLabel(binding.state)}
              variant={mapBindingStateVariant(binding.state)}
            />
          </dd>
        </div>
        <div className={styles.valueListRow}>
          <dt>来源 / 类型</dt>
          <dd>{`${binding.provider} · ${binding.entityType}`}</dd>
        </div>
        <div className={styles.valueListRow}>
          <dt>Provider 条目</dt>
          <dd>{binding.providerItemId}</dd>
        </div>
        <div className={styles.valueListRow}>
          <dt>匹配方式</dt>
          <dd>{binding.matchMethod}</dd>
        </div>
        {typeof binding.confidence === 'number' ? (
          <div className={styles.valueListRow}>
            <dt>置信度</dt>
            <dd>{`${(binding.confidence * 100).toFixed(0)}%`}</dd>
          </div>
        ) : null}
        <div className={styles.valueListRow}>
          <dt>锁定</dt>
          <dd>{binding.isLocked ? '已锁定' : '未锁定'}</dd>
        </div>
      </dl>
    </article>
  );
}

function ScrapeTaskCard({ task }: { task: ManageMediaItemScrapeTaskRecord }) {
  return (
    <article className={styles.valueCard}>
      <div className={styles.valueCardTitle}>刮削任务</div>
      <dl className={styles.valueList}>
        <div className={styles.valueListRow}>
          <dt>状态</dt>
          <dd>
            <StatusBadge
              label={mapTaskStatusLabel(task.status)}
              variant={mapTaskStatusVariant(task.status)}
            />
          </dd>
        </div>
        <div className={styles.valueListRow}>
          <dt>来源 / 类型</dt>
          <dd>{`${task.provider} · ${task.entityType}`}</dd>
        </div>
        <div className={styles.valueListRow}>
          <dt>指纹</dt>
          <dd>
            <span title={task.fingerprint}>{shortFingerprint(task.fingerprint)}</span>
          </dd>
        </div>
        <div className={styles.valueListRow}>
          <dt>尝试次数</dt>
          <dd>{`${task.attemptCount} / ${task.maxAttempts}`}</dd>
        </div>
        <div className={styles.valueListRow}>
          <dt>触发原因</dt>
          <dd>
            {task.requestReason}
            {task.forceRefresh ? (
              <span className={sharedStyles.chip} style={{ marginLeft: 6 }}>
                强制刷新
              </span>
            ) : null}
          </dd>
        </div>
        {task.nextRetryAt ? (
          <div className={styles.valueListRow}>
            <dt>下次重试</dt>
            <dd>
              {formatDateTime(task.nextRetryAt)}
              <span className={sharedStyles.mutedText}>
                {' '}
                ({formatRelativeTime(task.nextRetryAt)})
              </span>
            </dd>
          </div>
        ) : null}
        {task.lastError ? (
          <div className={styles.valueListRow}>
            <dt>上次错误</dt>
            <dd className={sharedStyles.mutedText}>{task.lastError}</dd>
          </div>
        ) : null}
        <div className={styles.valueListRow}>
          <dt>更新时间</dt>
          <dd>{formatDateTime(task.updatedAt)}</dd>
        </div>
      </dl>
    </article>
  );
}

interface PipelineSectionProps {
  pipeline?: ManageMediaItemPipelineRecord;
  pipelineLoading: boolean;
  pipelineError?: unknown;
  enqueuePending: boolean;
  onEnqueueScrape: (force: boolean) => void;
}

export function PipelineSection({
  pipeline,
  pipelineLoading,
  pipelineError,
  enqueuePending,
  onEnqueueScrape,
}: PipelineSectionProps) {
  const hasActiveBinding = Boolean(pipeline?.identityBinding);
  const scrapeTask = pipeline?.scrapeTask;
  const identifyTask = pipeline?.identifyTask;
  const binding = pipeline?.identityBinding;
  const isTaskActive = scrapeTask ? ACTIVE_TASK_STATUSES.has(scrapeTask.status) : false;
  const buttonsDisabled = !hasActiveBinding || enqueuePending;

  return (
    <ManageSectionCard
      title="识别与刮削管线"
      description="实时显示当前资源的识别任务、身份绑定与最近一次刮削任务，可手动触发或强制重新刮削。"
    >
      <div className={sharedStyles.chipRow}>
        <span className={sharedStyles.chip}>
          当前 metadata 来源：{pipeline?.currentMetadataSource ?? '—'}
        </span>
        {pipeline?.reviewStatus ? (
          <span className={sharedStyles.chip}>审核状态：{pipeline.reviewStatus}</span>
        ) : null}
        {isTaskActive ? (
          <span className={sharedStyles.chip}>
            <Loader2 size={12} className={styles.inlineSpin} /> 任务进行中
          </span>
        ) : null}
      </div>

      {pipelineLoading && !pipeline ? (
        <div className={sharedStyles.emptyInlineState}>正在加载管线状态…</div>
      ) : pipelineError && !pipeline ? (
        <div className={sharedStyles.emptyInlineState}>
          <AlertCircle size={14} /> 管线状态加载失败，可稍后再试。
        </div>
      ) : (
        <Fragment>
          {!identifyTask && !binding && !scrapeTask ? (
            <div className={sharedStyles.emptyInlineState}>
              当前资源还没有识别 / 绑定 / 刮削记录。
            </div>
          ) : (
            <div className={styles.valueGrid}>
              {identifyTask ? <IdentifyTaskCard task={identifyTask} /> : null}
              {binding ? <IdentityBindingCard binding={binding} /> : null}
              {scrapeTask ? <ScrapeTaskCard task={scrapeTask} /> : null}
            </div>
          )}
        </Fragment>
      )}

      {!hasActiveBinding ? (
        <div className={sharedStyles.emptyInlineState}>
          需先在「识别」流程中完成 Active 身份绑定，才能手动入队刮削。
        </div>
      ) : null}

      <div className={styles.cardActionRow}>
        <button
          className={sharedStyles.primaryButton}
          type="button"
          onClick={() => onEnqueueScrape(false)}
          disabled={buttonsDisabled}
        >
          {enqueuePending ? <Loader2 size={16} className={styles.inlineSpin} /> : <Sparkles size={16} />}
          触发刮削
        </button>
        <button
          className={sharedStyles.secondaryButton}
          type="button"
          onClick={() => onEnqueueScrape(true)}
          disabled={buttonsDisabled}
        >
          {enqueuePending ? <Loader2 size={16} className={styles.inlineSpin} /> : <RefreshCcw size={16} />}
          强制重新刮削
        </button>
      </div>
    </ManageSectionCard>
  );
}
