import { FileText, ImagePlus, Save, Trash2, Upload } from "lucide-react";

import type {
  ManageMediaItemArtworkKind,
  ManageMediaItemDetailRecord,
  ManageMediaItemSubtitleOverrideRecord,
} from "@/domains/manage/media-items";
import { StatusBadge } from "@/shared/ui/common/StatusBadge";
import { formatDateTime } from "@/shared/utils/date";

import {
  ARTWORK_KINDS,
  buildArtworkByKind,
  buildScrapedArtworkByKind,
  formatBytes,
  getArtworkKindLabel,
  type ArtworkDeleteState,
  type SubtitleDraftState,
  type SubtitleUploadState,
} from "../helpers";
import { AssetPreview, RemoteAssetTable } from "../presentation";
import sharedStyles from "../../ManagePages.module.css";
import styles from "../../ManageMediaItemDetailPage.module.css";
import { ManageSectionCard } from "../../components";

export function ArtworkSection({
  detail,
  onUploadArtwork,
  onRequestDeleteArtwork,
}: {
  detail: ManageMediaItemDetailRecord;
  onUploadArtwork: (kind: ManageMediaItemArtworkKind, file: File | null) => void;
  onRequestDeleteArtwork: (artwork: ArtworkDeleteState) => void;
}) {
  const artworkByKind = buildArtworkByKind(detail);
  const scrapedArtworkByKind = buildScrapedArtworkByKind(detail);
  const scrapedArtworkList = detail.scrapedArtworks ?? [];
  const remoteArtworkAssets = (detail.remoteAssets ?? []).filter(
    (asset) => asset.assetType !== "subtitle",
  );
  const remoteArtworkByKind: Record<ManageMediaItemArtworkKind, (typeof remoteArtworkAssets)[number] | undefined> =
    {
      poster:
        remoteArtworkAssets.find((asset) => asset.assetType === "poster") ??
        remoteArtworkAssets.find((asset) => asset.assetType === "thumb"),
      backdrop: remoteArtworkAssets.find((asset) => asset.assetType === "backdrop"),
      thumb: remoteArtworkAssets.find((asset) => asset.assetType === "thumb"),
    };

  return (
    <ManageSectionCard
      title="图片与 artwork"
      description="这块是资源的本地图像覆盖区：预览当前生效图、上传替换、删除本地覆盖都在这里，不去回写远端。"
    >
      <div className={styles.actionCardGrid}>
        {ARTWORK_KINDS.map((entry) => {
          const localOverride = artworkByKind[entry.kind];
          const remoteArtwork = remoteArtworkByKind[entry.kind];
          const scrapedArtwork = scrapedArtworkByKind[entry.kind];
          const previewUrl = localOverride?.url ?? remoteArtwork?.url ?? scrapedArtwork?.url;
          const sourceLabel = localOverride
            ? `本地上传 · ${localOverride.originalFilename}`
            : remoteArtwork
              ? `远端 sidecar · ${remoteArtwork.assetTypeLabel}`
              : scrapedArtwork
                ? "刮削候选 · 还没落成本地覆盖"
                : "当前无图";
          const sourceChip = localOverride
            ? "本地覆盖中"
            : remoteArtwork
              ? "使用远端 sidecar"
              : scrapedArtwork
                ? "使用刮削候选"
                : "无图";

          return (
            <article key={entry.kind} className={styles.actionCard}>
              <AssetPreview title={entry.label} imageUrl={previewUrl} hint={sourceLabel} />
              <div className={styles.cardMetaRow}>
                <span className={sharedStyles.chip}>{entry.hint}</span>
                <span className={sharedStyles.chip}>{sourceChip}</span>
              </div>
              {localOverride ? (
                <div className={styles.cardNote}>
                  {localOverride.mimeType} · {formatBytes(localOverride.sizeBytes)} ·{" "}
                  {formatDateTime(localOverride.updatedAt)}
                </div>
              ) : remoteArtwork ? (
                <div className={styles.cardNote}>
                  {remoteArtwork.mountName ?? "聚合资源"} · {remoteArtwork.filePath}
                </div>
              ) : scrapedArtwork ? (
                <div className={styles.cardNote}>
                  {formatScrapedArtworkMeta(scrapedArtwork.width, scrapedArtwork.height)}
                  {scrapedArtwork.language ? ` · ${scrapedArtwork.language}` : ""}
                </div>
              ) : null}
              <div className={styles.cardActionRow}>
                <label className={sharedStyles.secondaryButton}>
                  <ImagePlus size={16} />
                  上传替换
                  <input
                    className={styles.hiddenInput}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      onUploadArtwork(entry.kind, file);
                      event.currentTarget.value = "";
                    }}
                  />
                </label>
                {!localOverride && previewUrl ? (
                  <a
                    className={sharedStyles.ghostButton}
                    href={previewUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    查看预览
                  </a>
                ) : null}
                {localOverride ? (
                  <>
                    <a
                      className={sharedStyles.ghostButton}
                      href={localOverride.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      查看文件
                    </a>
                    <button
                      className={sharedStyles.ghostButton}
                      type="button"
                      onClick={() => onRequestDeleteArtwork(localOverride)}
                    >
                      <Trash2 size={16} />
                      删除覆盖
                    </button>
                  </>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      <div className={styles.sectionBlock}>
        <div className={styles.blockTitle}>刮削图片候选</div>
        {scrapedArtworkList.length === 0 ? (
          <div className={sharedStyles.emptyInlineState}>
            当前没有 scrape snapshot artwork 候选。
          </div>
        ) : (
          <div className={styles.actionCardGrid}>
            {scrapedArtworkList.map((item, index) => (
              <article key={`${item.kind}-${item.url}-${index}`} className={styles.actionCard}>
                <AssetPreview
                  title={getScrapedArtworkLabel(item.kind)}
                  imageUrl={item.url}
                  hint="来源：最新成功 scrape snapshot"
                />
                <div className={styles.cardMetaRow}>
                  <span className={sharedStyles.chip}>{item.kind}</span>
                  {item.language ? (
                    <span className={sharedStyles.chip}>{item.language}</span>
                  ) : null}
                </div>
                <div className={styles.cardNote}>
                  {formatScrapedArtworkMeta(item.width, item.height)}
                </div>
                <div className={styles.cardActionRow}>
                  <a
                    className={sharedStyles.ghostButton}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    打开候选图
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className={styles.sectionBlock}>
        <div className={styles.blockTitle}>远端 sidecar 资源</div>
        <RemoteAssetTable assets={remoteArtworkAssets} />
      </div>

      <div className={styles.sectionBlock}>
        <div className={styles.blockTitle}>本地 artwork override 历史</div>
        {detail.artworkOverrides.length === 0 ? (
          <div className={sharedStyles.emptyInlineState}>当前还没有本地图像覆盖。</div>
        ) : (
          <div className={sharedStyles.tableWrap}>
            <table className={sharedStyles.table}>
              <thead>
                <tr>
                  <th>图片位</th>
                  <th>文件</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {detail.artworkOverrides.map((item) => (
                  <tr key={item.id}>
                    <td>{getArtworkKindLabel(item.artworkKind)}</td>
                    <td>
                      <div className={sharedStyles.stackText}>
                        <span>{item.originalFilename}</span>
                        <span className={sharedStyles.mutedText}>{item.storagePath}</span>
                      </div>
                    </td>
                    <td>
                      <div className={sharedStyles.stackText}>
                        <StatusBadge
                          label={item.isActive ? "当前生效" : "已停用"}
                          variant={item.isActive ? "success" : "neutral"}
                        />
                        <span className={sharedStyles.mutedText}>
                          {item.mimeType} · {formatBytes(item.sizeBytes)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.tableActionRow}>
                        <a
                          className={sharedStyles.ghostButton}
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          查看
                        </a>
                        <button
                          className={sharedStyles.ghostButton}
                          type="button"
                          onClick={() => onRequestDeleteArtwork(item)}
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ManageSectionCard>
  );
}

function getScrapedArtworkLabel(kind: string) {
  switch (kind) {
    case "poster":
      return "Poster";
    case "backdrop":
      return "Backdrop";
    case "thumb":
      return "Thumb";
    default:
      return kind;
  }
}

function formatScrapedArtworkMeta(width?: number, height?: number) {
  if (width && height) {
    return `${width} × ${height}`;
  }
  if (width) {
    return `宽 ${width}px`;
  }
  if (height) {
    return `高 ${height}px`;
  }
  return "尺寸未提供";
}

export function SubtitleSection({
  detail,
  subtitleUpload,
  onSubtitleFileSelect,
  onSubtitleUploadFieldChange,
  onSubtitleUploadActiveChange,
  onSubtitleUploadDefaultChange,
  onSubtitleUpload,
  uploadPending,
  subtitleDrafts,
  onSubtitleDraftFieldChange,
  onSubtitleDraftDefaultChange,
  onSubtitleSave,
  updatePending,
  onRequestDeleteSubtitle,
}: {
  detail: ManageMediaItemDetailRecord;
  subtitleUpload: SubtitleUploadState;
  onSubtitleFileSelect: (file: File | null) => void;
  onSubtitleUploadFieldChange: (
    key: "language" | "sortOrder",
    value: string,
  ) => void;
  onSubtitleUploadActiveChange: (checked: boolean) => void;
  onSubtitleUploadDefaultChange: (checked: boolean) => void;
  onSubtitleUpload: () => void;
  uploadPending: boolean;
  subtitleDrafts: Record<string, SubtitleDraftState>;
  onSubtitleDraftFieldChange: (
    overrideId: string,
    key: keyof SubtitleDraftState,
    value: string | boolean,
  ) => void;
  onSubtitleDraftDefaultChange: (
    overrideId: string,
    checked: boolean,
    draft: SubtitleDraftState,
  ) => void;
  onSubtitleSave: (overrideId: string) => void;
  updatePending: boolean;
  onRequestDeleteSubtitle: (item: ManageMediaItemSubtitleOverrideRecord) => void;
}) {
  const remoteSubtitleAssets = detail.remoteAssets.filter((asset) => asset.assetType === "subtitle");

  return (
    <ManageSectionCard
      title="字幕"
      description="字幕区只写本地态：上传补充、切换启用/默认、改顺序、删除本地覆盖，远端 sidecar 只读展示。"
    >
      <div className={styles.subtitleUploadCard}>
        <div className={styles.blockTitle}>上传本地字幕</div>
        <div className={styles.uploadStrip}>
          <label className={sharedStyles.secondaryButton}>
            <Upload size={16} />
            {subtitleUpload.file ? subtitleUpload.file.name : "选择字幕文件"}
            <input
              className={styles.hiddenInput}
              type="file"
              accept=".srt,.ass,.ssa,.vtt,text/plain,text/vtt"
              onChange={(event) => onSubtitleFileSelect(event.target.files?.[0] ?? null)}
            />
          </label>
          <label className={sharedStyles.label}>
            <span>语言标签</span>
            <input
              className={sharedStyles.input}
              type="text"
              placeholder="zh-Hans / en / ja"
              value={subtitleUpload.language}
              onChange={(event) => onSubtitleUploadFieldChange("language", event.target.value)}
            />
          </label>
          <label className={sharedStyles.label}>
            <span>排序</span>
            <input
              className={sharedStyles.input}
              type="number"
              value={subtitleUpload.sortOrder}
              onChange={(event) => onSubtitleUploadFieldChange("sortOrder", event.target.value)}
            />
          </label>
        </div>
        <div className={styles.checkboxRow}>
          <label className={styles.inlineCheckbox}>
            <input
              type="checkbox"
              checked={subtitleUpload.isActive}
              onChange={(event) => onSubtitleUploadActiveChange(event.target.checked)}
            />
            <span>上传后立即启用</span>
          </label>
          <label className={styles.inlineCheckbox}>
            <input
              type="checkbox"
              checked={subtitleUpload.isDefault}
              onChange={(event) => onSubtitleUploadDefaultChange(event.target.checked)}
            />
            <span>设为默认优先</span>
          </label>
          <button
            className={sharedStyles.primaryButton}
            type="button"
            onClick={onSubtitleUpload}
            disabled={uploadPending}
          >
            <Upload size={16} />
            {uploadPending ? "上传中…" : "上传字幕"}
          </button>
        </div>
      </div>

      <div className={styles.sectionBlock}>
        <div className={styles.blockTitle}>本地字幕 override</div>
        {detail.subtitleOverrides.length === 0 ? (
          <div className={sharedStyles.emptyInlineState}>当前还没有本地字幕覆盖。</div>
        ) : (
          <div className={styles.subtitleCardGrid}>
            {detail.subtitleOverrides.map((item) => {
              const draft = subtitleDrafts[item.id] ?? {
                language: item.language ?? "",
                isActive: item.isActive,
                isDefault: item.isDefault,
                sortOrder: String(item.sortOrder),
              };

              return (
                <article key={item.id} className={styles.subtitleCard}>
                  <div className={styles.subtitleCardHeader}>
                    <div>
                      <div className={styles.sourceCardTitle}>{item.originalFilename}</div>
                      <div className={styles.sourceCardSubtitle}>
                        {item.subtitleFormat} · {item.mimeType}
                      </div>
                    </div>
                    <StatusBadge
                      label={item.isActive ? "启用中" : "已停用"}
                      variant={item.isActive ? "success" : "neutral"}
                    />
                  </div>
                  <div className={styles.subtitleEditorGrid}>
                    <label className={sharedStyles.label}>
                      <span>语言</span>
                      <input
                        className={sharedStyles.input}
                        type="text"
                        value={draft.language}
                        onChange={(event) =>
                          onSubtitleDraftFieldChange(item.id, "language", event.target.value)
                        }
                      />
                    </label>
                    <label className={sharedStyles.label}>
                      <span>顺序</span>
                      <input
                        className={sharedStyles.input}
                        type="number"
                        value={draft.sortOrder}
                        onChange={(event) =>
                          onSubtitleDraftFieldChange(item.id, "sortOrder", event.target.value)
                        }
                      />
                    </label>
                  </div>
                  <div className={styles.checkboxRow}>
                    <label className={styles.inlineCheckbox}>
                      <input
                        type="checkbox"
                        checked={draft.isActive}
                        onChange={(event) =>
                          onSubtitleDraftFieldChange(item.id, "isActive", event.target.checked)
                        }
                      />
                      <span>启用</span>
                    </label>
                    <label className={styles.inlineCheckbox}>
                      <input
                        type="checkbox"
                        checked={draft.isDefault}
                        onChange={(event) =>
                          onSubtitleDraftDefaultChange(item.id, event.target.checked, draft)
                        }
                      />
                      <span>默认优先</span>
                    </label>
                    <span className={sharedStyles.mutedText}>更新于 {formatDateTime(item.updatedAt)}</span>
                  </div>
                  <div className={styles.cardActionRow}>
                    <a
                      className={sharedStyles.ghostButton}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FileText size={16} />
                      查看字幕
                    </a>
                    <button
                      className={sharedStyles.secondaryButton}
                      type="button"
                      onClick={() => onSubtitleSave(item.id)}
                      disabled={updatePending}
                    >
                      <Save size={16} />
                      保存设置
                    </button>
                    <button
                      className={sharedStyles.ghostButton}
                      type="button"
                      onClick={() => onRequestDeleteSubtitle(item)}
                    >
                      <Trash2 size={16} />
                      删除
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <div className={styles.sectionBlock}>
        <div className={styles.blockTitle}>远端字幕资源</div>
        <RemoteAssetTable assets={remoteSubtitleAssets} />
      </div>
    </ManageSectionCard>
  );
}
