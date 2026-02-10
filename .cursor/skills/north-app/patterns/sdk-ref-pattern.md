# SDK Context + useRef 模式

**适用场景**: 在 useEffect 中使用 SDK API，避免依赖变化导致无限循环。

**核心实现**:

```tsx
const hostAPIRef = React.useRef(hostAPI);
hostAPIRef.current = hostAPI;

// 只在挂载时执行一次
useEffect(() => {
  void hostAPIRef.current.getUserInfo().then((info) => {
    setUserId(info?.uid || 'dev-user');
  });
}, []);

// 数据加载依赖 userId，与 hostAPI 解耦
useEffect(() => {
  if (userId) {
    void fetchProjects({ userId });
  }
}, [userId, fetchProjects]);
```

**注意事项**:
- `hostAPI` 对象每次渲染可能是新引用，直接放 deps 会无限循环
- `useRef` 不触发重渲染，适合存储频繁变化但不需要触发 UI 更新的值
- 分离"获取用户信息"和"加载数据"两个 effect

**实例**: 所有 @north-app 应用的 SDK 初始化
