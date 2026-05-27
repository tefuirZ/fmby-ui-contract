# 兼容性

> contract 版本、fmby 后端版本、skin 版本之间的兼容性规则与升级策略。

---

## 三个版本号

| 版本号 | 来源 | 例子 |
|---|---|---|
| `contract_version` | 本仓库（fmby-ui-contract） tag | `0.1.0`, `0.2.0`, `1.0.0` |
| `fmby_version` | fmby 主仓 release | `0.2.5`, `0.3.0` |
| `skin.version` | skin 自己的 manifest | `1.0.0`, `2.3.1` |

skin 作者关心的：**自己的 `contract_version` 字段对应哪些 fmby 后端版本**。

---

## 兼容矩阵

> 这是 contract 的"权威表"，每次 contract 升级都要更新这里。

| contract_version | fmby 后端支持范围 | 备注 |
|---|---|---|
| `0.1.x` | `^0.2.0`（即 0.2.x，不含 0.3） | 初版合同 |
| `0.2.x` | `^0.3.0` | （计划）增加 `manage/skins` 自管理 API |
| `1.0.x` | `^1.0.0` | （计划）正式版，向后兼容承诺开始 |

> 当前你看到的版本可能更高，请始终参考 contract 仓库 tag 列表。

---

## semver 语义

contract 仓库严格遵循 semver：

| 版本变更 | 含义 | 例子 |
|---|---|---|
| MAJOR | 破坏性变更，skin 必须改 | 删了某 API 字段 / 改了 bootstrap 形状 |
| MINOR | 新增功能，向后兼容 | 加了新 API 端点 / 加了 manifest 可选字段 |
| PATCH | 修文档 / 修 schema bug | typo / 字段含义澄清 |

**承诺**：

- `1.0.0` 后，所有 MAJOR 升级会**至少提前一个 MINOR 版本** deprecate 旧字段
- PATCH 升级永远不破坏 skin

**1.0.0 之前（即 `0.x`）**：可能有破坏性变更，请密切关注 CHANGELOG。

---

## skin 怎么声明兼容范围

最常见的两种写法：

### 方式 A：精确 contract_version（推荐 0.x 期间）

```json
{
  "contract_version": "0.1.0"
}
```

后端读这个值，按下面规则判断：

```
backend.supported_contracts ⊇ skin.contract_version
```

例如后端支持 `["0.1.0", "0.1.1", "0.1.2"]`，skin 写 `0.1.0` ✅；写 `0.2.0` ❌。

### 方式 B：附加 fmby 版本约束

```json
{
  "contract_version": "0.1.0",
  "min_fmby_version": "0.2.5",
  "max_fmby_version": "0.3.0"
}
```

适用场景：你用了某个 contract 0.1.0 中**新增**的端点（PATCH 引入的），需要 fmby >= 0.2.5 才有。

---

## 当 fmby 后端不支持某个 skin

启动 / 重扫时日志：

```
WARN  fmby_server::skin_registry: skipping skin "modern": contract_version 0.2.0 not supported (backend supports ^0.1)
```

该 skin **不会出现在管理后台下拉菜单**——避免管理员误选导致白屏。

skin 文件本身不会被删——升级 fmby 后会自动重新认出。

---

## 升级路径建议

### 给 skin 作者

1. 监听 contract 仓库 release（订阅 GitHub）
2. 每次 contract MINOR 升级：
   - 看 CHANGELOG，确认是否有可选新功能想用
   - 想用 → 升 `contract_version` + `min_fmby_version`
   - 不想用 → 不动
3. 每次 contract MAJOR 升级：
   - 必看 migration guide
   - 改完测试，发新版

### 给 fmby 维护者

1. fmby 后端添加新 contract 支持时，**保留对老 contract 的兼容性 N 个版本**（建议 N=3 个 MINOR）
2. 删老 contract 支持前：
   - 在 release notes 提前公告
   - 启动时对老 contract skin warn
   - 至少给一个 fmby MINOR 版本的过渡期

---

## 破坏性变更举例（仅说明）

下面是**可能**触发 contract MAJOR 升级的事件类型：

| 事件 | MAJOR? |
|---|---|
| 删除 `/api/items` 端点 | ✅ |
| 改 `MediaItemSummary.title` 类型从 string → object | ✅ |
| 移除 bootstrap 字段 `auth.user_id` | ✅ |
| 改 manifest schema 必填字段（如新加一个必填项） | ✅ |
| 增加新的可选 manifest 字段 | ❌（MINOR） |
| 增加新的 API 端点 | ❌（MINOR） |
| 给 DTO 加新的可选字段 | ❌（PATCH 或 MINOR，看情况） |
| 改文档 / 改 schema 描述 | ❌（PATCH） |

---

## 如果后端和 skin 都需要灰度怎么办

短期建议：

- 用 `data/themes/` 双 skin 共存（modern@v1.x 和 modern@v2.x 用不同 name 区分）
- 灰度时切 active 到 v2，出问题切回 v1
- 等灰度完成再卸载老版本

长期（计划）：

- 同名多版本支持（见 [`lifecycle.md`](./lifecycle.md#多版本共存计划中)）

---

## 工具支持

- 本仓库的 [`schemas/manifest.schema.json`](../schemas/manifest.schema.json) 会跟随 contract 版本演进
- skin 仓库可以引入这个 schema 做 IDE 提示和 CI 校验
- contract 仓库每次发版会更新 [兼容矩阵](#兼容矩阵)

---

## 下一步

- 看 **API 契约**：[`../api/README.md`](../api/README.md)
- 看 **功能清单**（你的 skin 必须实现的功能）：[`../features/routes.md`](../features/routes.md)
