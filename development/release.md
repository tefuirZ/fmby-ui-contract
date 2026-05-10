# Development · Release

## 流程

1. 改 `manifest.version`（SemVer）
2. 跑构建 + 校验
3. 跑 [acceptance/](../acceptance/) 自检脚本
4. 在测试 fmby 实例预演（覆盖 [features/](../features/) 列出的页面）
5. 打 tag + 推 GitHub
6. 在 fmby 管理面上架（或上传 zip）

## 兼容性矩阵

每发版必须明确：

```
皮肤版本   fmby 兼容范围   备注
0.1.0      0.10.0~0.10.x   首发
0.2.0      0.10.0~0.11.x   兼容 0.11
0.3.0      0.11.0~0.11.x   不兼容 0.10（用了 0.11 新端点）
```

写在 README + manifest.compat 双向声明。

## 灰度

- 先在 admin 自身预览（用户级 active_ui_skin = my-skin）
- 验证后再 server-general 设站点默认

## 回滚

- 站点默认皮肤可一键改回 `default`
- 用户级覆盖独立，不影响其它用户

## 升级公告

- 在 README 写 changelog
- breaking 改动列出迁移指引
