import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { manageApi } from '@/domains/manage';
import { namingCleanupApi } from '@/domains/manage/naming';
import { queryKeys } from '@/shared/query-keys';
import { FeedbackState } from '@/shared/ui/common/FeedbackState';
import { InlineBanner } from '@/shared/ui/common/InlineBanner';
import { StatusBadge } from '@/shared/ui/common/StatusBadge';
import type { BannerState } from '@/shared/types/ui';
import styles from './ManagePages.module.css';
import guideStyles from './ManageOnboarding.module.css';
import {
  ManagePageHeader,
  ManageSectionCard,
  MetricCard,
  QuickLinkCard,
  getManageStatusVariant,
} from './components';
import { getErrorMessage } from '@/shared/utils/error';
import { formatDateTime } from '@/shared/utils/date';
import {
  buildSetupGuide,
  mapSetupStepStatusLabel,
  mapSetupStepStatusVariant,
} from './setup-guide';

function buildDisplayKpis(overview: ManageOverviewPageData, mounts: ManageMountOverviewItem[]) {
  const remoteMounts = mounts.filter((mount) => mount.mountType !== 'local');
  const healthyRemoteMounts = remoteMounts.filter(
    (mount) => mount.healthStatus === 'healthy',
  ).length;
  const attentionRemoteMounts = remoteMounts.filter(
    (mount) => mount.healthStatus === 'attention',
  ).length;
  const criticalRemoteMounts = remoteMounts.filter(
    (mount) => mount.healthStatus === 'critical',
  ).length;

  return overview.kpis.map((kpi) => {
    if (kpi.key !== 'remote-mounts') {
      return kpi;
    }

    if (remoteMounts.length === 0) {
      return {
        ...kpi,
        value: 0,
        trend: `当前未接入远程挂载 · 共 ${mounts.length} 个来源`,
        status: 'attention' as const,
      };
    }

    return {
      ...kpi,
      value: healthyRemoteMounts,
      trend:
        criticalRemoteMounts > 0
          ? `异常 ${criticalRemoteMounts} · 需关注 ${attentionRemoteMounts} · 正常 ${healthyRemoteMounts}/${remoteMounts.length}`
          : attentionRemoteMounts > 0
            ? `需关注 ${attentionRemoteMounts} · 正常 ${healthyRemoteMounts}/${remoteMounts.length}`
            : `${healthyRemoteMounts} / ${remoteMounts.length} 正常`,
      status:
        criticalRemoteMounts > 0
          ? 'critical'
          : attentionRemoteMounts > 0
            ? 'attention'
            : 'healthy',
    };
  });
}

type ManageOverviewPageData = ReturnType<typeof manageApi.getOverview> extends Promise<infer T>
  ? T
  : never;

type ManageMountOverviewItem = ReturnType<typeof manageApi.getMounts> extends Promise<infer T>
  ? T extends { items: infer U }
    ? U extends Array<infer V>
      ? V
      : never
    : never
  : never;

export function ManageOverviewPage() {
  const queryClient = useQueryClient();
  const [banner, setBanner] = useState<BannerState | null>(null);
  const overviewQuery = useQuery({
    queryKey: queryKeys.manage.overview(),
    queryFn: () => manageApi.getOverview(),
  });
  const mountsQuery = useQuery({
    queryKey: queryKeys.manage.mounts.list(),
    queryFn: () => manageApi.getMounts(),
  });
  const librariesQuery = useQuery({
    queryKey: queryKeys.manage.libraries.list(),
    queryFn: () => manageApi.getLibraries(),
  });
  const usersQuery = useQuery({
    queryKey: queryKeys.manage.users.list(),
    queryFn: () => manageApi.getUsers(),
  });
  const namingSettingsQuery = useQuery({
    queryKey: queryKeys.manage.namingScrape.settings(),
    queryFn: () => namingCleanupApi.getScrapeSettings(),
  });
  const recoverMutation = useMutation({
    mutationFn: (librarySourceId: string) =>
      manageApi.recoverUnavailableLibrarySource(librarySourceId),
    onSuccess: (result) => {
      setBanner({
        variant: 'success',
        title: '数据源已恢复显示',
        description: `来源 ${result.librarySourceId} 已通过可达性检查并恢复显示，可见性会重新参与浏览和播放链路。`,
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.manage.overview() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.manage.overviewHome() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.manage.mounts.list() });
    },
    onError: (error) => {
      setBanner({
        variant: 'error',
        title: '手动恢复失败',
        description: getErrorMessage(error),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.manage.overview() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.manage.overviewHome() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.manage.mounts.list() });
    },
  });

  if (
    overviewQuery.isPending ||
    mountsQuery.isPending ||
    librariesQuery.isPending ||
    usersQuery.isPending ||
    namingSettingsQuery.isPending
  ) {
    return (
      <FeedbackState
        variant="loading"
        title="正在加载管理总览"
        description="正在读取站点状态、媒体来源、媒体库和当前引导进度。"
      />
    );
  }

  if (
    overviewQuery.isError ||
    mountsQuery.isError ||
    librariesQuery.isError ||
    usersQuery.isError ||
    namingSettingsQuery.isError
  ) {
    return (
      <FeedbackState
        variant="error"
        title="管理总览加载失败"
        description={getErrorMessage(
          overviewQuery.error ??
            mountsQuery.error ??
            librariesQuery.error ??
            usersQuery.error ??
            namingSettingsQuery.error,
        )}
        action={
          <button
            className={styles.primaryButton}
            onClick={() => {
              void overviewQuery.refetch();
              void mountsQuery.refetch();
              void librariesQuery.refetch();
              void usersQuery.refetch();
              void namingSettingsQuery.refetch();
            }}
          >
            重试
          </button>
        }
      />
    );
  }

  const overview = overviewQuery.data;

  if (!overview || overview.kpis.length === 0) {
    return (
      <FeedbackState
        variant="empty"
        title="暂时没有可展示的管理数据"
        description="当前还没有足够的资源总览数据，先检查媒体库、挂载和扫描链路。"
        action={
          <button className={styles.secondaryButton} onClick={() => overviewQuery.refetch()}>
            刷新
          </button>
        }
      />
    );
  }

  const guide = buildSetupGuide({
    overview,
    mountsCount: mountsQuery.data?.items.length ?? 0,
    librariesCount: librariesQuery.data?.items.length ?? 0,
    usersCount: usersQuery.data?.items.length ?? 0,
    namingReady: Boolean(namingSettingsQuery.data),
  });
  const displayKpis = buildDisplayKpis(overview, mountsQuery.data?.items ?? []);

  if (guide.isSetupMode) {
    return (
      <div className={styles.page}>
        <ManagePageHeader
          title="先把媒体站跑起来"
          description="第一次进后台别先盯着统计，先把来源、媒体库、刮削和入库主链路走通。"
          meta={
            <StatusBadge
              label={`${guide.completedSteps} / ${guide.totalSteps} 步已完成`}
              variant="info"
            />
          }
          actions={
            <>
              <button
                className={styles.secondaryButton}
                type="button"
                onClick={() => {
                  void overviewQuery.refetch();
                  void mountsQuery.refetch();
                  void librariesQuery.refetch();
                  void usersQuery.refetch();
                  void namingSettingsQuery.refetch();
                }}
              >
                <RefreshCw size={16} />
                刷新状态
              </button>
              <Link className={styles.primaryButton} to="/manage/media/add">
                打开完整引导
              </Link>
            </>
          }
        />

        {banner ? (
          <InlineBanner
            variant={banner.variant}
            title={banner.title}
            description={banner.description}
          />
        ) : null}

        <div className={guideStyles.heroGrid}>
          <section className={guideStyles.heroCard}>
            <div className={styles.stackText}>
              <span className={styles.eyebrow}>首次运行</span>
              <h2 className={guideStyles.heroTitle}>{guide.headline}</h2>
              <p className={guideStyles.heroDescription}>{guide.description}</p>
            </div>
            <div className={guideStyles.heroStats}>
              <div className={guideStyles.heroStat}>
                <span className={guideStyles.heroStatLabel}>媒体来源</span>
                <strong className={guideStyles.heroStatValue}>
                  {mountsQuery.data?.items.length ?? 0}
                </strong>
              </div>
              <div className={guideStyles.heroStat}>
                <span className={guideStyles.heroStatLabel}>媒体库</span>
                <strong className={guideStyles.heroStatValue}>
                  {librariesQuery.data?.items.length ?? 0}
                </strong>
              </div>
              <div className={guideStyles.heroStat}>
                <span className={guideStyles.heroStatLabel}>已入库媒体</span>
                <strong className={guideStyles.heroStatValue}>
                  {overview.kpis.find((item) => item.key === 'media-items')?.value ?? 0}
                </strong>
              </div>
            </div>
          </section>

          <section className={guideStyles.summaryCard}>
            <div className={styles.stackText}>
              <strong>建议先做的事</strong>
              <span className={styles.mutedText}>
                你现在最该做的就是把媒体接进来并扫出第一批条目，别先钻进一堆高级页里迷路。
              </span>
            </div>
            <div className={styles.buttonRow}>
              <Link className={styles.primaryButton} to={guide.primaryActionTo}>
                {guide.primaryActionLabel}
              </Link>
              <Link className={styles.secondaryButton} to="/manage/site/settings">
                去看站点设置
              </Link>
            </div>
            <div className={guideStyles.jumpGrid}>
              <Link className={styles.quickLinkCard} to="/manage/media/mounts">
                <strong>媒体来源</strong>
                <span className={styles.mutedText}>先把本地目录或远端来源接进来。</span>
              </Link>
              <Link className={styles.quickLinkCard} to="/manage/media/libraries">
                <strong>媒体库</strong>
                <span className={styles.mutedText}>把电影库、剧集库先组织好。</span>
              </Link>
            </div>
          </section>
        </div>

        <ManageSectionCard
          title="按这个顺序走，最省心"
          description="每一步都带你去对应页面，不用先学会后台结构。"
        >
          <div className={guideStyles.stepGrid}>
            {guide.steps.map((step, index) => (
              <article
                key={step.id}
                className={guideStyles.stepCard}
                data-state={step.state}
              >
                <div className={guideStyles.stepHeader}>
                  <div className={styles.stackText}>
                    <span className={guideStyles.stepIndex}>{index + 1}</span>
                    <strong className={guideStyles.stepTitle}>{step.title}</strong>
                  </div>
                  <StatusBadge
                    label={mapSetupStepStatusLabel(step.state)}
                    variant={mapSetupStepStatusVariant(step.state)}
                  />
                </div>
                <p className={guideStyles.stepDescription}>{step.description}</p>
                <div className={guideStyles.stepActions}>
                  <Link className={styles.primaryButton} to={step.to}>
                    {step.actionLabel}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </ManageSectionCard>

        <ManageSectionCard
          title="当前最需要处理的提醒"
          description="先把会卡住入库和播放的坑填平。"
        >
          {overview.todoItems.length === 0 &&
          overview.unavailableSourceSummaries.length === 0 ? (
            <p className={styles.hintText}>当前没有挡住首次入库的高优先级问题。</p>
          ) : (
            <div className={styles.list}>
              {overview.todoItems.map((item) => (
                <div key={item.id} className={styles.riskItem}>
                  <div className={styles.inlineMeta}>
                    <StatusBadge
                      label={
                        item.level === 'critical'
                          ? '高风险'
                          : item.level === 'warning'
                            ? '需关注'
                            : '提示'
                      }
                      variant={getManageStatusVariant(item.level)}
                    />
                    <strong>{item.title}</strong>
                  </div>
                  <p className={styles.itemDescription}>{item.description}</p>
                </div>
              ))}
            </div>
          )}
        </ManageSectionCard>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <ManagePageHeader
        title="站点运行总览"
        description="先看哪里坏了、哪里缺东西，再看资源规模和常用入口，别把首页做成一堆无关统计。"
        meta={
          <>
            <StatusBadge
              label={overview.environmentLabel}
              variant={getManageStatusVariant(overview.environmentStatus)}
            />
            <span className={styles.metaText}>
              最近刷新：{formatDateTime(overview.refreshedAt)}
            </span>
          </>
        }
        actions={
          <>
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={() => overviewQuery.refetch()}
            >
              <RefreshCw size={16} />
              刷新
            </button>
            <Link className={styles.primaryButton} to="/manage/media/add">
              继续添加媒体
            </Link>
          </>
        }
      />

      {banner ? (
        <InlineBanner
          variant={banner.variant}
          title={banner.title}
          description={banner.description}
        />
      ) : null}

      <section className={styles.metricsGrid}>
        {displayKpis.map((kpi) => (
          <MetricCard
            key={kpi.key}
            label={kpi.label}
            value={kpi.value}
            trend={kpi.trend}
            status={kpi.status}
          />
        ))}
      </section>

      <div className={styles.twoColumn}>
        <ManageSectionCard
          title="待办与风险提醒"
          description="先处理会直接影响入库、刮削和播放的风险。"
        >
          {overview.todoItems.length === 0 && overview.unavailableSourceSummaries.length === 0 ? (
            <p className={styles.hintText}>当前没有待处理的资源或挂载风险。</p>
          ) : (
            <>
              {overview.todoItems.length > 0 ? (
                <div className={styles.list}>
                  {overview.todoItems.map((item) => (
                    <div key={item.id} className={styles.riskItem}>
                      <div className={styles.inlineMeta}>
                        <StatusBadge
                          label={item.level === 'critical' ? '高风险' : item.level === 'warning' ? '需关注' : '提示'}
                          variant={getManageStatusVariant(item.level)}
                        />
                        <strong>{item.title}</strong>
                      </div>
                      <p className={styles.itemDescription}>{item.description}</p>
                    </div>
                  ))}
                </div>
              ) : null}

              {overview.unavailableSourceSummaries.length > 0 ? (
                <div className={styles.list}>
                  {overview.unavailableSourceSummaries.map((item) => {
                    const isRecovering =
                      recoverMutation.isPending &&
                      recoverMutation.variables === item.librarySourceId;

                    return (
                      <div key={item.librarySourceId} className={styles.riskItem}>
                        <div className={styles.inlineMeta}>
                          <StatusBadge label="已隐藏" variant="danger" />
                          <strong>{item.libraryName} / {item.mountName}</strong>
                        </div>
                        <div className={styles.stackText}>
                          <span className={styles.primaryText}>
                            路径：{item.subPath || '/'}
                          </span>
                          <span className={styles.mutedText}>
                            连续失败 {item.consecutiveUnavailableFailures} 次
                            {item.lastFailureKind
                              ? ` · 最近原因：${mapFailureKindLabel(item.lastFailureKind)}`
                              : ''}
                            {item.hiddenAt
                              ? ` · 隐藏时间：${formatDateTime(item.hiddenAt)}`
                              : ''}
                          </span>
                          {item.lastFailureMessage ? (
                            <span className={styles.mutedText}>{item.lastFailureMessage}</span>
                          ) : null}
                          {item.lastSuccessAt ? (
                            <span className={styles.mutedText}>
                              最近成功：{formatDateTime(item.lastSuccessAt)}
                            </span>
                          ) : null}
                        </div>
                        <div className={styles.buttonRow}>
                          <button
                            className={styles.smallButton}
                            type="button"
                            disabled={isRecovering}
                            onClick={() => recoverMutation.mutate(item.librarySourceId)}
                          >
                            <RefreshCw size={14} />
                            {isRecovering ? '恢复中…' : '手动恢复'}
                          </button>
                          <Link className={styles.secondaryButton} to="/manage/media/mounts">
                            去看数据源
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </>
          )}
        </ManageSectionCard>

        <ManageSectionCard title="最近管理动作" description="需要回头查改动时，再看是谁改了什么。">
          {overview.activities.length === 0 ? (
            <p className={styles.hintText}>暂无最近管理动作。</p>
          ) : (
            <div className={styles.activityList}>
              {overview.activities.map((item) => (
                <div key={item.id} className={styles.activityItem}>
                  <div className={styles.activityTitle}>{item.title}</div>
                  <div className={styles.activitySummary}>{item.summary}</div>
                  <div className={styles.activityTime}>{formatDateTime(item.createdAt)}</div>
                </div>
              ))}
            </div>
          )}
        </ManageSectionCard>
      </div>

      <ManageSectionCard title="常用入口" description="高频入口放前面，别让人一层层翻。">
        <div className={styles.quickLinksGrid}>
          {overview.quickLinks.map((entry) => (
            <QuickLinkCard
              key={entry.id}
              to={entry.to}
              label={entry.label}
              description={entry.description}
            />
          ))}
        </div>
      </ManageSectionCard>
    </div>
  );
}

function mapFailureKindLabel(value: string) {
  switch (value) {
    case 'Unreachable':
      return '网络不可达';
    case 'Timeout':
      return '请求超时';
    case 'AuthExpired':
      return '认证失效';
    case 'PermissionDenied':
      return '权限不足';
    case 'ConfigError':
      return '配置错误';
    case 'RateLimited':
      return '上游限流';
    default:
      return value;
  }
}
