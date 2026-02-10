# 踩坑记录

来自实际项目开发的已知问题和解法。

---

## Realtime 相关

### CHANNEL_ERROR / TIMED_OUT

**现象**: Supabase Realtime 订阅报 `CHANNEL_ERROR` 或 `TIMED_OUT`，控制台刷屏。

**根因**: 表未启用 Realtime。需要手动执行 `ALTER PUBLICATION supabase_realtime ADD TABLE xxx`。

**解法**:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE writing_replacements;
ALTER PUBLICATION supabase_realtime ADD TABLE writing_versions;
```

**预防**: 新建表后立即在 Supabase Dashboard -> Database -> Replication 中启用。

---

### 订阅状态回调重复触发

**现象**: Realtime 失败时日志刷屏，状态回调多次触发。

**根因**: 缺少防重入标志。

**解法**: 添加 `resolved`/`statusLogged` 标志位，确保状态只处理一次。

```typescript
let statusLogged = false;
channel.subscribe((status, err) => {
  if (statusLogged) return;
  statusLogged = true;
  if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
    console.warn('Realtime 失败，启动轮询 fallback');
    startPollingFallback();
  }
});
```

---

## 状态管理

### 自动保存覆盖新版本

**现象**: 点击"全部接受"后保存成功，但刷新后内容还是旧的。

**根因**: `acceptAllReplacements` 没有取消 `autoSaveTimer`，导致旧数据覆盖新版本。

**解法**:
1. `acceptAllReplacements` 开始时 `clearTimeout(autoSaveTimer)`
2. 设置 `hasUnsavedChanges: false`
3. 设置 `isSaving: true` 作为保存锁

**预防**: 任何批量操作前先取消定时器，操作后重置保存状态。

---

### 废弃 Store 仍被引用

**现象**: 迁移 Store 后部分组件仍使用旧 Store。

**根因**: 迁移不彻底。

**解法**: 全局搜索旧 Store 的 import，逐个替换。在旧文件添加 `@deprecated` 标记。

---

## 版本管理

### 版本号重复

**现象**: 数据库中出现多个 `version_number = 1`。

**根因**: 使用 `count + 1` 生成版本号，删除中间版本后计数不对。

**解法**: 改为 `MAX(version_number) + 1`。

---

### 内容只有 32 字符

**现象**: 编辑器内容被截断。

**根因**: AI 创建的版本用 `ai-generated://` 作为 `fileUrl`，实际内容只存在 `content_preview`（限 500 字符）。

**解法**: 直接在 `content` 字段存储完整文档，不依赖远程文件链。

---

## 配置

### CSP 拦截资源加载

**现象**: 页面加载后某些资源被浏览器拦截。

**解法**: 在 `next.config.js` 中添加 CSP headers，确保 `connect-src` 包含 Supabase 域名。

---

## 日志

### 生产环境日志刷屏

**现象**: 生产环境控制台被调试日志淹没。

**根因**: 使用 `console.log` 而非分级日志。

**解法**: 使用统一日志工具（见 [logging-standards.md](logging-standards.md)），通过 `LOG_LEVEL` 环境变量控制。
