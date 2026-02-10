# 性能优化指南

## 概述

本指南涵盖Web和移动端应用的性能优化策略。

---

## 前端性能优化

### 1. 渲染优化

#### React组件优化

```typescript
// ❌ 每次渲染都创建新函数
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={() => toggleTodo(todo.id)}  // 每次渲染新函数
        />
      ))}
    </ul>
  );
}

// ✅ 使用useCallback避免不必要的重渲染
function TodoList({ todos }) {
  const handleToggle = useCallback((id: string) => {
    toggleTodo(id);
  }, []);

  return (
    <ul>
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={handleToggle}
        />
      ))}
    </ul>
  );
}

// ✅ 使用React.memo避免不必要的重渲染
const TodoItem = React.memo(function TodoItem({ todo, onToggle }) {
  return (
    <li onClick={() => onToggle(todo.id)}>
      {todo.title}
    </li>
  );
});
```

#### 列表虚拟化

```typescript
// ❌ 渲染所有项目
function LongList({ items }) {
  return (
    <ul>
      {items.map(item => <Item key={item.id} item={item} />)}
    </ul>
  );
}

// ✅ 使用虚拟化只渲染可见项目
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <Item item={items[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 2. 数据获取优化

#### 请求去重

```typescript
// ✅ 使用React Query自动去重
import { useQuery } from '@tanstack/react-query';

function useTodo(id: string) {
  return useQuery({
    queryKey: ['todo', id],
    queryFn: () => fetchTodo(id),
    staleTime: 5 * 60 * 1000,  // 5分钟内不重新获取
  });
}
```

#### 预加载

```typescript
// ✅ 预加载下一页数据
function TodoList() {
  const { data, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  // 预加载下一页
  useEffect(() => {
    if (hasNextPage) {
      queryClient.prefetchInfiniteQuery({
        queryKey: ['todos'],
        queryFn: fetchTodos,
      });
    }
  }, [hasNextPage]);
}
```

### 3. 代码分割

```typescript
// ✅ 路由级别代码分割
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

### 4. 图片优化

```typescript
// ✅ 使用next/image自动优化
import Image from 'next/image';

function Avatar({ src, alt }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={48}
      height={48}
      placeholder="blur"
      loading="lazy"
    />
  );
}
```

---

## 后端性能优化

### 1. 数据库优化

#### 索引优化

```sql
-- ✅ 为常用查询字段添加索引
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_created_at ON todos(created_at DESC);
CREATE INDEX idx_todos_user_completed ON todos(user_id, completed);
```

#### N+1查询优化

```typescript
// ❌ N+1查询
async function getTodosWithUsers() {
  const todos = await db.todos.findMany();
  
  // 为每个todo单独查询user
  for (const todo of todos) {
    todo.user = await db.users.findUnique({ where: { id: todo.userId } });
  }
  
  return todos;
}

// ✅ 使用include一次性加载
async function getTodosWithUsers() {
  return db.todos.findMany({
    include: {
      user: true,
    },
  });
}

// ✅ 或使用DataLoader批量加载
const userLoader = new DataLoader(async (userIds) => {
  const users = await db.users.findMany({
    where: { id: { in: userIds } },
  });
  return userIds.map(id => users.find(u => u.id === id));
});
```

#### 分页优化

```typescript
// ❌ 使用OFFSET分页（大数据量性能差）
const todos = await db.todos.findMany({
  skip: page * pageSize,
  take: pageSize,
});

// ✅ 使用游标分页
const todos = await db.todos.findMany({
  take: pageSize,
  cursor: cursor ? { id: cursor } : undefined,
  orderBy: { createdAt: 'desc' },
});
```

### 2. 缓存策略

#### 应用层缓存

```typescript
import { Redis } from 'ioredis';

const redis = new Redis();
const CACHE_TTL = 60 * 5; // 5分钟

async function getTodo(id: string): Promise<Todo> {
  // 尝试从缓存获取
  const cached = await redis.get(`todo:${id}`);
  if (cached) {
    return JSON.parse(cached);
  }

  // 从数据库获取
  const todo = await db.todos.findUnique({ where: { id } });
  
  // 写入缓存
  if (todo) {
    await redis.setex(`todo:${id}`, CACHE_TTL, JSON.stringify(todo));
  }

  return todo;
}

// 更新时清除缓存
async function updateTodo(id: string, data: UpdateTodoInput): Promise<Todo> {
  const todo = await db.todos.update({ where: { id }, data });
  await redis.del(`todo:${id}`);
  return todo;
}
```

#### HTTP缓存

```typescript
// 设置缓存头
app.get('/api/todos/:id', async (req, res) => {
  const todo = await getTodo(req.params.id);
  
  res.set({
    'Cache-Control': 'public, max-age=300',  // 5分钟
    'ETag': generateETag(todo),
  });
  
  res.json(todo);
});
```

### 3. 异步处理

```typescript
// ❌ 同步发送邮件（阻塞响应）
app.post('/api/users', async (req, res) => {
  const user = await createUser(req.body);
  await sendWelcomeEmail(user.email);  // 阻塞
  res.json(user);
});

// ✅ 使用消息队列异步处理
app.post('/api/users', async (req, res) => {
  const user = await createUser(req.body);
  await messageQueue.publish('emails', {
    type: 'welcome',
    email: user.email,
  });
  res.json(user);
});
```

---

## 移动端性能优化

### 1. React Native优化

#### FlashList替代FlatList

```typescript
// ✅ 使用FlashList获得更好的性能
import { FlashList } from '@shopify/flash-list';

function TodoList({ todos }) {
  return (
    <FlashList
      data={todos}
      renderItem={({ item }) => <TodoItem todo={item} />}
      estimatedItemSize={60}
    />
  );
}
```

#### 使用Reanimated进行动画

```typescript
// ✅ 使用Reanimated在UI线程执行动画
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

function AnimatedButton() {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[styles.button, animatedStyle]}>
        <Text>Press me</Text>
      </Animated.View>
    </Pressable>
  );
}
```

#### 避免桥接瓶颈

```typescript
// ❌ 频繁的桥接通信
function handleScroll(event: NativeScrollEvent) {
  // 每帧都通过桥接传递
  setScrollY(event.nativeEvent.contentOffset.y);
}

// ✅ 使用Reanimated在UI线程处理
const scrollY = useSharedValue(0);

const scrollHandler = useAnimatedScrollHandler({
  onScroll: (event) => {
    scrollY.value = event.contentOffset.y;
  },
});
```

### 2. 内存优化

```typescript
// ✅ 及时清理订阅
useEffect(() => {
  const subscription = eventEmitter.subscribe(handler);
  
  return () => {
    subscription.unsubscribe();
  };
}, []);

// ✅ 图片内存优化
<Image
  source={{ uri: imageUrl }}
  resizeMode="cover"
  style={styles.image}
/>
```

---

## 性能监控

### 前端监控

```typescript
// 使用Web Vitals监控核心指标
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);  // Cumulative Layout Shift
getFID(console.log);  // First Input Delay
getFCP(console.log);  // First Contentful Paint
getLCP(console.log);  // Largest Contentful Paint
getTTFB(console.log); // Time to First Byte
```

### 后端监控

```typescript
// 请求耗时监控中间件
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
    
    // 上报到监控系统
    metrics.recordLatency(req.path, duration);
  });
  
  next();
});
```

---

## 性能指标目标

| 指标 | 目标 | 描述 |
|------|------|------|
| FCP | < 1.8s | 首次内容绘制 |
| LCP | < 2.5s | 最大内容绘制 |
| FID | < 100ms | 首次输入延迟 |
| CLS | < 0.1 | 累积布局偏移 |
| TTI | < 3.8s | 可交互时间 |

---

## 版本历史

- **v1.0.0**（2026-01-27）：初始版本
