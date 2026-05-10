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

**用户列表**：表格 + 多选 + 顶栏批量操作（禁用 / 启用 / 改角色 / 删除）；行内动作（详情 / 重置密码）  
**用户详情**：基本信息 / 角色 / 可见库 / 设备会话 / 活动历史  
**角色模板**：CRUD；权限位用 checkbox 矩阵；删除前检查引用计数  
**注册码**：批量发码 + 复制全部 / 导出 CSV；按 batch 折叠；过期临近警示

## 皮肤建议
- 重置密码 → 模态显示临时密码（一次性）+ 复制按钮
- 批量操作必须显示影响数量并二次确认
- superadmin 不可被普通 admin 修改
