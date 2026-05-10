import { RotateCcw, Save } from "lucide-react";

import type {
  ManageMediaItemDetailRecord,
  ManageMediaItemMetadataRecord,
} from "@/domains/manage/media-items";

import {
  buildEmptyMetadataRecord,
  type MetadataFormErrors,
  type MetadataFormState,
} from "../helpers";
import { MetadataValueCard } from "../presentation";
import sharedStyles from "../../ManagePages.module.css";
import styles from "../../ManageMediaItemDetailPage.module.css";
import { ManageSectionCard } from "../../components";

export function MetadataComparisonSection({
  detail,
  baselineMetadata,
}: {
  detail: ManageMediaItemDetailRecord;
  baselineMetadata: ManageMediaItemMetadataRecord;
}) {
  return (
    <ManageSectionCard
      title="元数据对照"
      description="先把当前生效值、远端/NFO 值、刮削源值和本地 override 拆开看清楚，保存时才不会把字段写成一锅粥。"
    >
      <div className={styles.valueGrid}>
        <MetadataValueCard label="当前生效" metadata={detail.effectiveMetadata} />
        <MetadataValueCard label="远端 / NFO" metadata={baselineMetadata} />
        {detail.scrapedMetadata ? (
          <MetadataValueCard
            label="Scraped 元数据（来自刮削源）"
            metadata={detail.scrapedMetadata}
          />
        ) : null}
        <MetadataValueCard
          label="本地 override"
          metadata={detail.localMetadataOverride?.metadata ?? buildEmptyMetadataRecord()}
        />
      </div>
    </ManageSectionCard>
  );
}

export function MetadataEditorSection({
  form,
  errors,
  onFieldChange,
}: {
  form: MetadataFormState;
  errors: MetadataFormErrors;
  onFieldChange: (key: keyof MetadataFormState, value: string) => void;
}) {
  return (
    <ManageSectionCard
      title="元数据编辑器"
      description="这块直接写本地元数据覆盖。复杂字段用逗号或换行处理，不搞臃肿富文本。"
    >
      <div className={styles.formGrid}>
        <label className={sharedStyles.label}>
          <span>标题</span>
          <input
            className={sharedStyles.input}
            type="text"
            value={form.title}
            onChange={(event) => onFieldChange("title", event.target.value)}
          />
        </label>

        <label className={sharedStyles.label}>
          <span>原始标题</span>
          <input
            className={sharedStyles.input}
            type="text"
            value={form.originalTitle}
            onChange={(event) => onFieldChange("originalTitle", event.target.value)}
          />
        </label>

        <label className={sharedStyles.label}>
          <span>排序标题</span>
          <input
            className={sharedStyles.input}
            type="text"
            value={form.sortTitle}
            onChange={(event) => onFieldChange("sortTitle", event.target.value)}
          />
        </label>

        <label className={sharedStyles.label}>
          <span>年份</span>
          <input
            className={`${sharedStyles.input} ${errors.year ? sharedStyles.inputInvalid : ""}`}
            type="text"
            inputMode="numeric"
            value={form.year}
            onChange={(event) => onFieldChange("year", event.target.value)}
          />
          {errors.year ? <span className={sharedStyles.fieldErrorText}>{errors.year}</span> : null}
        </label>

        <label className={sharedStyles.label}>
          <span>评分</span>
          <input
            className={`${sharedStyles.input} ${errors.communityRating ? sharedStyles.inputInvalid : ""}`}
            type="text"
            inputMode="decimal"
            value={form.communityRating}
            onChange={(event) => onFieldChange("communityRating", event.target.value)}
          />
          {errors.communityRating ? (
            <span className={sharedStyles.fieldErrorText}>{errors.communityRating}</span>
          ) : null}
        </label>

        <label className={sharedStyles.label}>
          <span>首映日期</span>
          <input
            className={`${sharedStyles.input} ${errors.premiered ? sharedStyles.inputInvalid : ""}`}
            type="text"
            placeholder="YYYY-MM-DD"
            value={form.premiered}
            onChange={(event) => onFieldChange("premiered", event.target.value)}
          />
          {errors.premiered ? (
            <span className={sharedStyles.fieldErrorText}>{errors.premiered}</span>
          ) : null}
        </label>
      </div>

      <label className={sharedStyles.label}>
        <span>概述</span>
        <textarea
          className={sharedStyles.textarea}
          value={form.overview}
          onChange={(event) => onFieldChange("overview", event.target.value)}
        />
      </label>

      <div className={styles.formGrid}>
        <label className={sharedStyles.label}>
          <span>类型标签</span>
          <textarea
            className={styles.compactTextarea}
            placeholder="用逗号或换行分隔"
            value={form.genres}
            onChange={(event) => onFieldChange("genres", event.target.value)}
          />
        </label>

        <label className={sharedStyles.label}>
          <span>导演</span>
          <textarea
            className={styles.compactTextarea}
            placeholder="用逗号或换行分隔"
            value={form.directors}
            onChange={(event) => onFieldChange("directors", event.target.value)}
          />
        </label>

        <label className={sharedStyles.label}>
          <span>制片厂</span>
          <textarea
            className={styles.compactTextarea}
            placeholder="用逗号或换行分隔"
            value={form.studios}
            onChange={(event) => onFieldChange("studios", event.target.value)}
          />
        </label>

        <label className={sharedStyles.label}>
          <span>演员</span>
          <textarea
            className={`${styles.compactTextarea} ${errors.actors ? sharedStyles.inputInvalid : ""}`}
            placeholder="一行一个，格式：姓名 | 角色"
            value={form.actors}
            onChange={(event) => onFieldChange("actors", event.target.value)}
          />
          {errors.actors ? (
            <span className={sharedStyles.fieldErrorText}>{errors.actors}</span>
          ) : null}
        </label>
      </div>
    </ManageSectionCard>
  );
}

export function MetadataStickyBar({
  dirtyCount,
  isMetadataWriting,
  updatePending,
  onDiscard,
  onReset,
  onSave,
}: {
  dirtyCount: number;
  isMetadataWriting: boolean;
  updatePending: boolean;
  onDiscard: () => void;
  onReset: () => void;
  onSave: () => void;
}) {
  return (
    <div className={styles.stickyBar}>
      <div className={styles.stickySummary}>
        <strong>元数据草稿未保存</strong>
        <span>当前有 {dirtyCount} 个字段与详情已生效值不同。</span>
      </div>
      <div className={styles.cardActionRow}>
        <button
          className={sharedStyles.ghostButton}
          type="button"
          onClick={onDiscard}
          disabled={isMetadataWriting}
        >
          放弃修改
        </button>
        <button
          className={sharedStyles.secondaryButton}
          type="button"
          onClick={onReset}
          disabled={isMetadataWriting}
        >
          <RotateCcw size={16} />
          恢复默认
        </button>
        <button
          className={sharedStyles.primaryButton}
          type="button"
          onClick={onSave}
          disabled={isMetadataWriting}
        >
          <Save size={16} />
          {updatePending ? "保存中…" : "保存元数据"}
        </button>
      </div>
    </div>
  );
}
