import { useMemo } from 'react';
import { Search } from 'lucide-react';
import type { ManageUserRecord, UserStatus } from '@/domains/manage';
import { StatusBadge } from '@/shared/ui/common/StatusBadge';
import { formatDateTime } from '@/shared/utils/date';
import styles from '../../ManagePages.module.css';
import { EmptyTableRow, ManageSectionCard, getManageStatusVariant } from '../../components';
import { describeSourceGrantSummary, getNextUserAction, getUserStatusLabel } from '../formUtils';

interface UserTableProps {
  users: ManageUserRecord[];
  filteredUsers: ManageUserRecord[];
  currentUserId?: string;
  keyword: string;
  statusFilter: 'all' | UserStatus;
  selectedUserIds: string[];
  onKeywordChange: (value: string) => void;
  onStatusFilterChange: (value: 'all' | UserStatus) => void;
  onSelectUser: (userId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onOpenView: (userId: string) => void;
  onOpenEdit: (userId: string) => void;
  onToggleUserStatus: (user: ManageUserRecord) => void;
}

export function UserTable({
  users,
  filteredUsers,
  currentUserId,
  keyword,
  statusFilter,
  selectedUserIds,
  onKeywordChange,
  onStatusFilterChange,
  onSelectUser,
  onSelectAll,
  onOpenView,
  onOpenEdit,
  onToggleUserStatus,
}: UserTableProps) {
  const selectableUsers = useMemo(
    () =>
      filteredUsers.filter(
        (user) => user.status !== 'disabled' && user.id !== currentUserId,
      ),
    [currentUserId, filteredUsers],
  );
  const allSelectableChecked =
    selectableUsers.length > 0 && selectableUsers.every((user) => selectedUserIds.includes(user.id));

  return (
    <ManageSectionCard title="账号列表" description="支持搜索、详情抽屉、系统角色调整、来源路径授权和批量编辑。">
      <div className={styles.toolbar}>
        <div className={styles.filterGroup}>
          <label className={styles.label}>
            搜索用户
            <div className={styles.inlineMeta}>
              <Search size={16} />
              <input
                className={styles.searchInput}
                value={keyword}
                onChange={(event) => onKeywordChange(event.target.value)}
                placeholder="用户名 / 显示名 / 角色 / 来源路径"
              />
            </div>
          </label>
          <label className={styles.label}>
            状态
            <select
              className={styles.select}
              value={statusFilter}
              onChange={(event) => onStatusFilterChange(event.target.value as 'all' | UserStatus)}
            >
              <option value="all">全部状态</option>
              <option value="active">正常</option>
              <option value="pending">待激活</option>
              <option value="disabled">已停用</option>
              <option value="locked">已锁定</option>
            </select>
          </label>
        </div>
        <span className={styles.tableHint}>当前结果：{filteredUsers.length} 条</span>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>
                <input
                  className={styles.checkbox}
                  type="checkbox"
                  checked={allSelectableChecked}
                  onChange={(event) => onSelectAll(event.target.checked)}
                  aria-label="选择当前结果中的全部可批量删除账号"
                />
              </th>
              <th>账号</th>
              <th>角色</th>
              <th>状态</th>
              <th>来源授权</th>
              <th>创建时间</th>
              <th>最近登录</th>
              <th>最近设备</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <EmptyTableRow
                colSpan={9}
                title={users.length === 0 ? '暂无用户' : '没有匹配结果'}
                description={users.length === 0 ? '待后端返回用户管理数据后展示。' : '尝试放宽搜索关键词或切换状态筛选。'}
              />
            ) : (
              filteredUsers.map((user) => {
                const nextAction = getNextUserAction(user);
                const checked = selectedUserIds.includes(user.id);
                const isCurrentUser = user.id === currentUserId;
                return (
                  <tr key={user.id}>
                    <td>
                      <input
                        className={styles.checkbox}
                        type="checkbox"
                        checked={checked}
                        disabled={user.status === 'disabled' || isCurrentUser}
                        onChange={(event) => onSelectUser(user.id, event.target.checked)}
                        aria-label={`选择用户 ${user.username}`}
                      />
                    </td>
                    <td>
                      <div className={styles.stackText}>
                        <button className={styles.ghostButton} type="button" onClick={() => onOpenView(user.id)}>
                          {user.displayName || user.username}
                        </button>
                        <span className={styles.mutedText}>@{user.username}</span>
                      </div>
                    </td>
                    <td className={styles.nowrap}>{user.roleLabel}</td>
                    <td className={styles.nowrap}>
                      <StatusBadge label={getUserStatusLabel(user.status)} variant={getManageStatusVariant(user.status)} />
                    </td>
                    <td>{describeSourceGrantSummary(user)}</td>
                    <td className={styles.nowrap}>{formatDateTime(user.createdAt)}</td>
                    <td className={styles.nowrap}>{formatDateTime(user.lastLoginAt)}</td>
                    <td className={styles.nowrap}>{user.lastDevice || '—'}</td>
                    <td className={styles.actionsCell}>
                      <div className={styles.tableActionRow}>
                        <button className={styles.smallButton} type="button" onClick={() => onOpenView(user.id)}>详情</button>
                        <button className={styles.smallButton} type="button" onClick={() => onOpenEdit(user.id)}>编辑</button>
                        <button
                          className={
                            user.status === 'disabled'
                              ? styles.smallButton
                              : styles.smallDangerButton
                          }
                          type="button"
                          disabled={isCurrentUser}
                          onClick={() => onToggleUserStatus(user)}
                        >
                          {isCurrentUser ? '当前账号' : nextAction.label}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </ManageSectionCard>
  );
}
