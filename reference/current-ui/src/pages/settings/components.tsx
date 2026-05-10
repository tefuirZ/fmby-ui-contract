import * as React from 'react';
import type { ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
import styles from './SettingsCenter.module.css';

export function SettingsPageHeader({
  title,
  description,
  meta,
}: {
  title: string;
  description: string;
  meta?: ReactNode;
}) {
  return (
    <header className={styles.pageHeader}>
      <div className={styles.pageHeaderContent}>
        <div className={styles.pageEyebrow}>设置中心</div>
        <h1 className={styles.pageTitle}>{title}</h1>
        <p className={styles.pageDescription}>{description}</p>
      </div>
      {meta ? <div className={styles.pageMeta}>{meta}</div> : null}
    </header>
  );
}

export function SettingsSectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.sectionCard}>
      <div>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {description ? <p className={styles.sectionDescription}>{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

interface EditableSettingsOptions<T> {
  queryKey: QueryKey;
  load: () => Promise<T>;
  save: (draft: T) => Promise<T | void>;
  successMessage: string;
}

export function useEditableSettings<T>({
  queryKey,
  load,
  save,
  successMessage,
}: EditableSettingsOptions<T>) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey,
    queryFn: load,
  });
  const [draft, setDraft] = React.useState<T | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (query.data) {
      setDraft(query.data);
    }
  }, [query.data]);

  const mutation = useMutation({
    mutationFn: async (nextDraft: T) => {
      const response = await save(nextDraft);
      return (response ?? nextDraft) as T;
    },
    onSuccess: (response) => {
      queryClient.setQueryData(queryKey, response);
      setDraft(response);
      setSuccess(successMessage);
    },
  });

  const isDirty =
    query.data !== undefined &&
    draft !== null &&
    JSON.stringify(query.data) !== JSON.stringify(draft);

  return {
    query,
    draft,
    setDraft,
    isDirty,
    success,
    setSuccess,
    mutation,
    reset() {
      if (query.data) {
        setDraft(query.data);
      }
    },
    save() {
      if (draft) {
        mutation.mutate(draft);
      }
    },
  };
}

export function StickySaveBar({
  dirty,
  pending,
  success,
  onReset,
  onSave,
}: {
  dirty: boolean;
  pending: boolean;
  success?: string | null;
  onReset: () => void;
  onSave: () => void;
}) {
  if (!dirty && !success) {
    return null;
  }

  return (
    <div className={styles.stickyBar}>
      <div>
        <strong>{dirty ? '有未保存修改' : '设置已保存'}</strong>
        <div className={styles.stickyHint}>
          {dirty
            ? '当前页按分组保存，保存成功前会保留脏状态。'
            : success}
        </div>
      </div>
      <div className={styles.stickyActions}>
        {dirty ? (
          <>
            <button className={styles.secondaryButton} type="button" onClick={onReset}>
              放弃修改
            </button>
            <button className={styles.primaryButton} type="button" onClick={onSave}>
              {pending ? '保存中…' : '保存设置'}
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
