# Skin Lifecycle

> 一个 skin 在 fmby 运行环境中的完整生命周期：注册 → 激活 → 使用 → 升级 / 回滚 → 卸载。

---

## 注册（registration）

skin 进入 fmby 视野的方式：

| 方式 | 触发时机 | 说明 |
|---|---|---|
| 内置（built-in） | 容器启动 | `COPY` 到 `/app/themes/`，启动时扫描 |
| 运行时拷贝 | 重启后生效 | scp、docker cp、`unzip` 到运行时 themes 目录 |
| 管理后台上传 | 未实现 | 当前一方契约没有 skin 上传 API |

**注册 = 通过 manifest 校验 + 加入 ThemeRegistry**。失败的 skin 不会出现在管理后台下拉菜单。

### 重扫（rescan）

当前一方契约没有 skin 运行时重扫 API。生产环境新增或删除运行时 skin 后，以重启 fmby 作为稳定生效路径；第三方 skin 不要依赖计划中的重扫/上传 API。

---

## 激活（activation）

只有一个 skin 能"激活"——即用户访问 `/` 时返回的 `index.html` 是哪个 skin 的。

激活操作：

```http
PUT /api/settings/server/general
Content-Type: application/json
X-CSRF-Token: ...

{
  ...其他字段,
  "active_ui_skin": "modern"
}
```

**激活生效**：立即生效——下一个 fallback 请求就会读最新值。

**正在线用户**：不影响——他们刷新页面才会切到新 skin。

**约束**：

- 只有 `manage:settings:server` 权限（即管理员）可改
- 只能选 ThemeRegistry 里存在且校验通过的 skin
- 改成不存在的 skin → 4xx + `ApiErrorResponse.code`

---

## 升级（upgrade）

升级 skin 即用新版本覆盖旧版本：

### 内置 skin 升级

= 重新构建镜像 + 重启容器。

### 运行时 skin 升级

```bash
# 备份
mv /app/data/themes/modern /app/data/themes/modern.bak

# 解压新版本
unzip modern-v1.3.0.zip -d /app/data/themes/

# 验证（看日志）
docker logs fmby --tail 20

# 出错就回滚
rm -rf /app/data/themes/modern
mv /app/data/themes/modern.bak /app/data/themes/modern
```

**正在线用户**：刷新页面后会拿到新版本（hashed assets 自动失效）。

### 升级注意事项

- ✅ `name` 不能变（变了就是新 skin，不是升级）
- ⚠️ `contract_version` 大版本变化前请看 [`compatibility.md`](./compatibility.md)
- ⚠️ `localStorage_keys` 变化前最好做 migration（旧 skin 的本地缓存可能脏）

---

## 卸载（uninstallation）

### 卸载非 active skin

直接删目录：

```bash
rm -rf /app/data/themes/modern
docker restart fmby
```

重启会让 ThemeRegistry 重建。

### 卸载 active skin

如果删的是当前 active skin：

1. fmby 重扫时检测到 active 不存在
2. fallback 到 classic（如果 classic 在）
3. 否则 fallback 到 ThemeRegistry 第一个
4. 否则**启动失败**（必须至少留一个 skin）

**强烈建议**：卸载前先在管理后台切到别的 skin，再删目录。

---

## 回滚（rollback）

### 场景 1：升级后发现新版有 bug

```bash
mv /app/data/themes/modern /app/data/themes/modern.broken
mv /app/data/themes/modern.bak /app/data/themes/modern
# 重扫或重启
```

### 场景 2：active skin 启动后白屏

1. SSH 到容器
2. 改数据库 `active_ui_skin`：

```sql
UPDATE settings
SET value = 'classic'
WHERE key = 'server.general.active_ui_skin';
```

3. 重启 fmby

或者**临时**用环境变量覆盖（计划中）：

```bash
FMBY_FORCE_ACTIVE_SKIN=classic ./fmby-server
```

---

## 多版本共存（计划中）

未来 ThemeRegistry 可能支持同名多版本：

```
data/themes/modern@1.2.3/
data/themes/modern@1.3.0/
```

- 默认激活最新 semver
- 管理后台可显式锁版本（用于灰度 / 回滚）
- 当前**版本未实现**，每个 `name` 只能存在一份

---

## 状态机

```
              ┌─────────┐
              │ uploaded│  (manifest 还没解析)
              └────┬────┘
                   │ scan
                   ▼
       ┌──────────────────────┐
       │  manifest validation │
       └──┬─────────────┬─────┘
          │ ✅          │ ❌
          ▼             ▼
   ┌────────────┐  ┌──────────┐
   │ registered │  │ rejected │  (在日志里 warn，不出现在下拉菜单)
   └─────┬──────┘  └──────────┘
         │ admin sets active_ui_skin
         ▼
   ┌────────────┐
   │  active    │
   └─────┬──────┘
         │ admin switches to another / disable
         ▼
   ┌────────────┐
   │ registered │ (回到非 active)
   └────────────┘
```

---

## 运维 checklist

### 每次升级 skin 前

- [ ] 备份当前版本（`mv x x.bak`）
- [ ] 看新版本的 CHANGELOG / breaking changes
- [ ] 验证 `contract_version` 兼容
- [ ] 升级后看 fmby 日志有无 warn

### 每次切换 active skin 前

- [ ] 在测试环境先验过
- [ ] 通知用户"会有视觉变化，刷新即可"
- [ ] 记得带 `X-CSRF-Token`

### 长期建议

- [ ] 内置至少一个稳定 skin（如 classic）作为 fallback
- [ ] 周期性 audit `data/themes/` 目录，清理废弃 skin
- [ ] 大版本升级 fmby 后端时，先看 contract 仓库的 compatibility matrix

---

## 下一步

- 看 **兼容矩阵**：[`compatibility.md`](./compatibility.md)
- 看 **API 怎么写**：[`../api/README.md`](../api/README.md)
