# Features · Manage · Users

含 3 个独立页面：用户、角色模板、注册码。

## 路由
- `/manage/site/users/accounts`：用户列表
- `/manage/site/users/role-templates`：角色模板
- `/manage/site/users/registration-codes`：注册码

## 数据
- [../../api/domains/manage/users.md](../../api/domains/manage/users.md)
- [../../api/domains/manage/registration-codes.md](../../api/domains/manage/registration-codes.md)

## UI 要点

**用户列表**：表格 + 后端分页 / 后端筛选 + 多选 + 顶栏批量操作（禁用 / 启用 / 改角色 / 删除）；行内动作（详情 / 重置密码 / 解除账号登录风控）。批量选择只覆盖当前页可操作账号，切换页码、搜索词、状态或账号类型筛选必须清空选择。
**用户详情**：基本信息 / 角色 / 可见库 / 设备会话 / 活动历史  
**角色模板**：CRUD；权限位用 checkbox 矩阵；删除前检查引用计数  
**注册码**：批量发码 + 复制全部 / 导出 CSV；按 batch 折叠；过期临近警示

## 弹窗交互基线

- 用户新建 / 编辑、角色模板新建 / 编辑都属于高频表单弹窗；输入首字符后文本框不得自动失焦。
- 在普通文本输入框上按 `Enter` 不得直接把弹窗关掉；只有显式提交成功或显式取消/关闭才允许收起。
- 校验报错后主按钮必须仍然可见，提交区高度和按钮位置不能突然跳掉。
- 角色模板权限矩阵可以响应键盘导航，但不能因为 focus 管理错误把输入焦点抢走。

## 皮肤建议
- 重置密码 → 管理员输入新密码 + 确认密码 + 可选强制下次改密 + 敏感操作确认；默认不强制改密，不展示旧密码、新密码或临时密码。
- 解除账号登录风控 → 敏感操作确认，调用 `POST /api/manage/users/{userId}/login-risk/reset`；文案明确不解除 IP 限流
- 批量操作必须显示影响数量并二次确认
- Admin 账号的高危修改必须以后端 capability guard 与敏感操作确认结果为准；前端只做展示和二次确认，不用角色名硬编码权限边界。
