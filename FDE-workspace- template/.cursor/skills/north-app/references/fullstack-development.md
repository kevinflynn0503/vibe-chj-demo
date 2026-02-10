---
name: fullstack-development
description: "全栈开发规范 - 后端API实现、前端界面开发、代码规范、最佳实践的完整指南。"
version: 1.0.0
category: development
---

# 全栈开发规范

> 好的代码是自解释的 — 清晰的结构、规范的命名、适当的注释

---

## 一、开发职责

### 职责边界

```yaml
后端职责:
  核心:
    - API端点实现
    - 业务逻辑处理
    - 数据库操作
    - 认证授权
    
  质量:
    - 输入验证
    - 错误处理
    - 日志记录
    - API文档
    
前端职责:
  核心:
    - 页面/组件实现
    - 状态管理
    - API集成
    - 路由配置
    
  质量:
    - 响应式设计
    - 加载状态
    - 错误处理
    - 用户体验
    
不做什么:
  ❌ 不编写测试（由测试工程师负责）
  ❌ 不负责移动端（由移动端开发负责）
  ❌ 不做架构决策（由架构师负责）
```

---

## 二、后端开发

### 项目结构

```
backend/
├── src/
│   ├── api/                    # API层
│   │   ├── routes/             # 路由定义
│   │   │   ├── index.ts        # 路由注册
│   │   │   ├── auth.ts         # 认证路由
│   │   │   ├── users.ts        # 用户路由
│   │   │   └── todos.ts        # 待办路由
│   │   └── middleware/         # 中间件
│   │       ├── auth.ts         # 认证中间件
│   │       ├── error.ts        # 错误处理
│   │       └── validation.ts   # 验证中间件
│   │
│   ├── services/               # 业务逻辑层
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   └── todo.service.ts
│   │
│   ├── repositories/           # 数据访问层（可选）
│   │   ├── user.repository.ts
│   │   └── todo.repository.ts
│   │
│   ├── models/                 # 数据模型/类型
│   │   ├── user.ts
│   │   └── todo.ts
│   │
│   ├── lib/                    # 工具库
│   │   ├── prisma.ts           # Prisma客户端
│   │   ├── redis.ts            # Redis客户端
│   │   ├── jwt.ts              # JWT工具
│   │   ├── hash.ts             # 密码哈希
│   │   └── logger.ts           # 日志工具
│   │
│   ├── config/                 # 配置
│   │   ├── env.ts              # 环境变量
│   │   └── constants.ts        # 常量
│   │
│   └── app.ts                  # 应用入口
│
├── prisma/
│   ├── schema.prisma           # 数据库Schema
│   └── migrations/             # 数据库迁移
│
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

### 分层架构

```
┌─────────────────────────────────────────────────────────────────┐
│                          API层                                   │
│  职责：路由、请求验证、响应格式化                                │
│  文件：routes/*.ts, middleware/*.ts                             │
├─────────────────────────────────────────────────────────────────┤
│                        Service层                                 │
│  职责：业务逻辑、事务处理、跨实体操作                            │
│  文件：services/*.service.ts                                    │
├─────────────────────────────────────────────────────────────────┤
│                      Repository层（可选）                        │
│  职责：数据访问抽象、复杂查询封装                                │
│  文件：repositories/*.repository.ts                             │
├─────────────────────────────────────────────────────────────────┤
│                        Model层                                   │
│  职责：数据结构定义、验证Schema                                  │
│  文件：models/*.ts                                              │
├─────────────────────────────────────────────────────────────────┤
│                        Prisma层                                  │
│  职责：数据库操作、ORM                                          │
│  文件：prisma/schema.prisma                                     │
└─────────────────────────────────────────────────────────────────┘
```

### 代码实现示例

#### 入口文件

```typescript
// src/app.ts

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env';
import { logger } from './lib/logger';
import { errorHandler } from './api/middleware/error';
import routes from './api/routes';

const app = express();

// 中间件
app.use(helmet());
app.use(cors({ origin: config.corsOrigins }));
app.use(express.json({ limit: '10mb' }));

// 请求日志
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// 路由
app.use('/api/v1', routes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 错误处理
app.use(errorHandler);

// 启动服务
const PORT = config.port || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export default app;
```

#### 路由定义

```typescript
// src/api/routes/todos.ts

import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { todoService } from '../../services/todo.service';
import { asyncHandler } from '../../lib/async-handler';

const router = Router();

// 验证Schema
const createTodoSchema = z.object({
  body: z.object({
    title: z.string().min(1, '标题不能为空').max(255),
    description: z.string().optional(),
    priority: z.number().int().min(0).max(3).default(0),
    dueDate: z.string().datetime().optional(),
  }),
});

const updateTodoSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    priority: z.number().int().min(0).max(3).optional(),
    completed: z.boolean().optional(),
    dueDate: z.string().datetime().optional(),
  }),
});

/**
 * 获取待办列表
 * GET /api/v1/todos
 */
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status } = req.query;
    
    const result = await todoService.findAll({
      userId: req.user!.id,
      page: Number(page),
      limit: Number(limit),
      status: status as string,
    });
    
    res.json(result);
  })
);

/**
 * 创建待办
 * POST /api/v1/todos
 */
router.post(
  '/',
  authenticate,
  validate(createTodoSchema),
  asyncHandler(async (req, res) => {
    const todo = await todoService.create({
      ...req.body,
      userId: req.user!.id,
    });
    
    res.status(201).json({ data: todo });
  })
);

/**
 * 获取单个待办
 * GET /api/v1/todos/:id
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const todo = await todoService.findById(req.params.id, req.user!.id);
    res.json({ data: todo });
  })
);

/**
 * 更新待办
 * PATCH /api/v1/todos/:id
 */
router.patch(
  '/:id',
  authenticate,
  validate(updateTodoSchema),
  asyncHandler(async (req, res) => {
    const todo = await todoService.update(
      req.params.id,
      req.user!.id,
      req.body
    );
    
    res.json({ data: todo });
  })
);

/**
 * 删除待办
 * DELETE /api/v1/todos/:id
 */
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    await todoService.delete(req.params.id, req.user!.id);
    res.status(204).send();
  })
);

export default router;
```

#### Service层

```typescript
// src/services/todo.service.ts

import { prisma } from '../lib/prisma';
import { NotFoundError, ForbiddenError } from '../lib/errors';
import type { Todo, CreateTodoInput, UpdateTodoInput } from '../models/todo';

/**
 * 待办事项服务
 * 
 * 职责：
 * - 业务逻辑处理
 * - 数据验证（业务层面）
 * - 跨实体操作
 */
class TodoService {
  /**
   * 获取待办列表
   * 
   * @param params.userId - 用户ID
   * @param params.page - 页码
   * @param params.limit - 每页数量
   * @param params.status - 状态筛选
   * @returns 待办列表和分页信息
   */
  async findAll(params: {
    userId: string;
    page: number;
    limit: number;
    status?: string;
  }) {
    const { userId, page, limit, status } = params;
    const skip = (page - 1) * limit;
    
    // 构建筛选条件
    const where: any = { userId };
    if (status === 'active') {
      where.completed = false;
    } else if (status === 'completed') {
      where.completed = true;
    }
    
    // 并行查询数据和总数
    const [todos, total] = await Promise.all([
      prisma.todo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.todo.count({ where }),
    ]);
    
    return {
      data: todos,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 获取单个待办
   * 
   * @param id - 待办ID
   * @param userId - 用户ID（用于权限验证）
   * @throws NotFoundError - 待办不存在
   * @throws ForbiddenError - 无权限访问
   */
  async findById(id: string, userId: string): Promise<Todo> {
    const todo = await prisma.todo.findUnique({
      where: { id },
    });
    
    if (!todo) {
      throw new NotFoundError('待办事项不存在');
    }
    
    if (todo.userId !== userId) {
      throw new ForbiddenError('无权限访问此待办');
    }
    
    return todo;
  }

  /**
   * 创建待办
   * 
   * @param input - 创建参数
   * @returns 创建的待办
   */
  async create(input: CreateTodoInput): Promise<Todo> {
    return prisma.todo.create({
      data: {
        title: input.title,
        description: input.description,
        priority: input.priority,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        userId: input.userId,
      },
    });
  }

  /**
   * 更新待办
   * 
   * @param id - 待办ID
   * @param userId - 用户ID
   * @param input - 更新参数
   * @returns 更新后的待办
   */
  async update(id: string, userId: string, input: UpdateTodoInput): Promise<Todo> {
    // 验证权限
    await this.findById(id, userId);
    
    // 处理完成时间
    const data: any = { ...input };
    if (input.completed === true) {
      data.completedAt = new Date();
    } else if (input.completed === false) {
      data.completedAt = null;
    }
    
    return prisma.todo.update({
      where: { id },
      data,
    });
  }

  /**
   * 删除待办
   * 
   * @param id - 待办ID
   * @param userId - 用户ID
   */
  async delete(id: string, userId: string): Promise<void> {
    // 验证权限
    await this.findById(id, userId);
    
    await prisma.todo.delete({
      where: { id },
    });
  }
}

export const todoService = new TodoService();
```

#### 中间件

```typescript
// src/api/middleware/auth.ts

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../lib/jwt';
import { UnauthorizedError } from '../../lib/errors';

/**
 * 认证中间件
 * 
 * 功能：
 * - 验证JWT Token
 * - 将用户信息挂载到请求对象
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('未提供认证令牌');
    }
    
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    
    // 挂载用户信息到请求
    req.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
    };
    
    next();
  } catch (error) {
    next(new UnauthorizedError('认证失败'));
  }
};

// src/api/middleware/error.ts

import { Request, Response, NextFunction } from 'express';
import { logger } from '../../lib/logger';
import { AppError } from '../../lib/errors';

/**
 * 全局错误处理中间件
 * 
 * 功能：
 * - 统一错误响应格式
 * - 区分开发/生产环境
 * - 记录错误日志
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 记录错误
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  
  // 处理已知错误
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    });
  }
  
  // 处理未知错误
  const isProd = process.env.NODE_ENV === 'production';
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: isProd ? '服务器内部错误' : err.message,
      ...(!isProd && { stack: err.stack }),
    },
  });
};
```

---

## 三、前端开发

### 项目结构

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # 认证页面组
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/        # 仪表板页面组
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx        # 首页
│   │   │   └── todos/
│   │   │       ├── page.tsx
│   │   │       └── [id]/
│   │   │           └── page.tsx
│   │   ├── layout.tsx          # 根布局
│   │   ├── page.tsx            # 落地页
│   │   └── globals.css
│   │
│   ├── components/             # 组件
│   │   ├── ui/                 # 基础UI组件（shadcn）
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   ├── forms/              # 表单组件
│   │   │   ├── login-form.tsx
│   │   │   └── todo-form.tsx
│   │   ├── layouts/            # 布局组件
│   │   │   ├── header.tsx
│   │   │   └── sidebar.tsx
│   │   └── features/           # 功能组件
│   │       └── todos/
│   │           ├── todo-list.tsx
│   │           └── todo-item.tsx
│   │
│   ├── hooks/                  # 自定义Hooks
│   │   ├── use-auth.ts
│   │   ├── use-todos.ts
│   │   └── use-debounce.ts
│   │
│   ├── lib/                    # 工具库
│   │   ├── api.ts              # API客户端
│   │   ├── utils.ts            # 工具函数
│   │   └── validations.ts      # 验证Schema
│   │
│   ├── stores/                 # 状态管理
│   │   └── auth.ts             # 认证状态
│   │
│   └── types/                  # TypeScript类型
│       ├── api.ts              # API类型
│       └── entities.ts         # 实体类型
│
├── public/                     # 静态资源
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

### 代码实现示例

#### API客户端

```typescript
// src/lib/api.ts

import { useAuthStore } from '@/stores/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

/**
 * API客户端类
 * 
 * 功能：
 * - 统一请求处理
 * - 自动添加认证头
 * - 错误处理
 * - 请求/响应拦截
 */
class ApiClient {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // 获取token
    const token = useAuthStore.getState().token;
    
    // 设置headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };
    
    // 发起请求
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // 处理响应
    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(
        error.error?.message || '请求失败',
        response.status,
        error.error?.code
      );
    }
    
    // 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }
    
    return response.json();
  }
  
  // GET请求
  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }
  
  // POST请求
  post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
  
  // PATCH请求
  patch<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
  
  // DELETE请求
  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_BASE);

// 自定义错误类
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

#### React Query Hooks

```typescript
// src/hooks/use-todos.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Todo, CreateTodoInput, UpdateTodoInput } from '@/types/entities';

/**
 * 待办事项Hook
 * 
 * 功能：
 * - 获取待办列表
 * - 创建/更新/删除待办
 * - 自动缓存管理
 * - 乐观更新
 */

// 查询键
const todoKeys = {
  all: ['todos'] as const,
  lists: () => [...todoKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...todoKeys.lists(), filters] as const,
  details: () => [...todoKeys.all, 'detail'] as const,
  detail: (id: string) => [...todoKeys.details(), id] as const,
};

interface UseTodosParams {
  page?: number;
  limit?: number;
  status?: 'all' | 'active' | 'completed';
}

interface TodoListResponse {
  data: Todo[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * 获取待办列表Hook
 */
export function useTodos(params: UseTodosParams = {}) {
  const { page = 1, limit = 20, status = 'all' } = params;
  
  return useQuery({
    queryKey: todoKeys.list({ page, limit, status }),
    queryFn: async (): Promise<TodoListResponse> => {
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(status !== 'all' && { status }),
      });
      return api.get(`/todos?${queryParams}`);
    },
  });
}

/**
 * 获取单个待办Hook
 */
export function useTodo(id: string) {
  return useQuery({
    queryKey: todoKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<{ data: Todo }>(`/todos/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * 创建待办Hook
 */
export function useCreateTodo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateTodoInput) => {
      const response = await api.post<{ data: Todo }>('/todos', input);
      return response.data;
    },
    onSuccess: () => {
      // 刷新列表
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
    },
  });
}

/**
 * 更新待办Hook
 */
export function useUpdateTodo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateTodoInput & { id: string }) => {
      const response = await api.patch<{ data: Todo }>(`/todos/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      // 更新缓存
      queryClient.setQueryData(todoKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
    },
  });
}

/**
 * 删除待办Hook
 */
export function useDeleteTodo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/todos/${id}`);
      return id;
    },
    onSuccess: (id) => {
      // 移除缓存
      queryClient.removeQueries({ queryKey: todoKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
    },
  });
}
```

#### 组件实现

```tsx
// src/components/features/todos/todo-list.tsx

'use client';

import { useState } from 'react';
import { useTodos, useCreateTodo, useDeleteTodo } from '@/hooks/use-todos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TodoItem } from './todo-item';
import { TodoListSkeleton } from './todo-list-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import type { Todo } from '@/types/entities';

/**
 * 待办列表组件
 * 
 * 功能：
 * - 显示待办列表
 * - 添加新待办
 * - 筛选（全部/进行中/已完成）
 * - 分页
 */
interface TodoListProps {
  initialFilter?: 'all' | 'active' | 'completed';
}

export function TodoList({ initialFilter = 'all' }: TodoListProps) {
  // 状态
  const [filter, setFilter] = useState(initialFilter);
  const [newTodo, setNewTodo] = useState('');
  const [page, setPage] = useState(1);
  
  // 数据获取
  const { data, isLoading, error } = useTodos({ page, status: filter });
  const createMutation = useCreateTodo();
  const deleteMutation = useDeleteTodo();
  
  // 处理添加
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    
    await createMutation.mutateAsync({ title: newTodo });
    setNewTodo('');
  };
  
  // 处理删除
  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };
  
  // 加载状态
  if (isLoading) {
    return <TodoListSkeleton />;
  }
  
  // 错误状态
  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive">加载失败：{error.message}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            重试
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  const { data: todos, meta } = data!;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>待办事项</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 添加表单 */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="添加新待办..."
            disabled={createMutation.isPending}
          />
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? '添加中...' : '添加'}
          </Button>
        </form>
        
        {/* 筛选按钮 */}
        <div className="flex gap-2">
          {(['all', 'active', 'completed'] as const).map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setFilter(status);
                setPage(1);
              }}
            >
              {status === 'all' ? '全部' : status === 'active' ? '进行中' : '已完成'}
            </Button>
          ))}
        </div>
        
        {/* 列表 */}
        {todos.length === 0 ? (
          <EmptyState
            title="暂无待办"
            description="添加一个待办事项开始吧"
          />
        ) : (
          <ul className="space-y-2">
            {todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onDelete={() => handleDelete(todo.id)}
              />
            ))}
          </ul>
        )}
        
        {/* 分页 */}
        {meta.totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              上一页
            </Button>
            <span className="py-2 px-4 text-sm">
              {page} / {meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              下一页
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## 四、代码规范

### 命名规范

```yaml
文件命名:
  组件: "PascalCase (TodoList.tsx)"
  Hooks: "camelCase + use前缀 (useTodos.ts)"
  工具: "camelCase (formatDate.ts)"
  类型: "camelCase (entities.ts)"
  常量: "camelCase (constants.ts)"
  
变量命名:
  变量: "camelCase (userName)"
  常量: "UPPER_SNAKE_CASE (MAX_PAGE_SIZE)"
  类/接口: "PascalCase (UserService)"
  私有属性: "camelCase (无前缀)"
  
函数命名:
  普通函数: "camelCase + 动词 (getUserById)"
  事件处理: "handle + 名词 + 动词 (handleUserClick)"
  布尔返回: "is/has/can + 形容词/名词 (isValid)"
  
React相关:
  组件: "PascalCase (TodoList)"
  Props: "组件名 + Props (TodoListProps)"
  Context: "名词 + Context (AuthContext)"
  Provider: "名词 + Provider (AuthProvider)"
```

### 注释规范

```typescript
/**
 * 函数/类的文档注释
 * 
 * 说明函数的作用、参数、返回值、异常
 * 
 * @param id - 用户ID
 * @param options - 可选配置
 * @returns 用户信息
 * @throws NotFoundError - 用户不存在时抛出
 * 
 * @example
 * ```ts
 * const user = await getUserById('123');
 * ```
 */
async function getUserById(id: string, options?: GetOptions): Promise<User> {
  // 实现代码...
}

// 单行注释 - 解释复杂逻辑
const hash = await bcrypt.hash(password, 10); // bcrypt加密，10轮

/*
 * 多行注释
 * 用于解释复杂的算法或业务逻辑
 * 可以包含多段说明
 */

// TODO: 待实现的功能
// FIXME: 需要修复的问题
// HACK: 临时解决方案，需要优化
// NOTE: 需要注意的点
```

### 错误处理规范

```typescript
// 定义业务错误类
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = '资源不存在') {
    super(message, 'NOT_FOUND', 404);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = '未授权') {
    super(message, 'UNAUTHORIZED', 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = '禁止访问') {
    super(message, 'FORBIDDEN', 403);
  }
}

// 使用示例
async function getUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  
  if (!user) {
    throw new NotFoundError('用户不存在');
  }
  
  return user;
}
```

---

## 五、最佳实践

### 后端最佳实践

```yaml
API设计:
  - 使用统一的响应格式
  - 使用适当的HTTP状态码
  - 实现请求验证
  - 添加请求限流
  - 记录详细日志

安全:
  - 密码使用bcrypt加密
  - 使用JWT进行认证
  - 验证所有用户输入
  - 防止SQL注入（使用ORM）
  - 设置CORS策略

性能:
  - 使用数据库索引
  - 实现分页查询
  - 使用Redis缓存
  - 避免N+1查询
  - 异步处理耗时操作
```

### 前端最佳实践

```yaml
组件设计:
  - 单一职责原则
  - Props类型定义完整
  - 使用组合而非继承
  - 提取可复用组件

状态管理:
  - 区分服务端/客户端状态
  - 使用React Query处理服务端状态
  - 最小化全局状态
  - 合理使用缓存

性能优化:
  - 使用React.memo优化渲染
  - 懒加载组件和路由
  - 优化图片加载
  - 使用虚拟列表处理大数据

用户体验:
  - 实现加载状态
  - 优雅处理错误
  - 提供操作反馈
  - 支持键盘导航
```

---

## 六、检查清单

### 后端检查

- [ ] API响应格式统一
- [ ] 输入验证完整
- [ ] 错误处理规范
- [ ] 认证授权正确
- [ ] 日志记录完善
- [ ] 数据库查询优化

### 前端检查

- [ ] 组件类型定义完整
- [ ] 加载/错误状态处理
- [ ] 响应式设计
- [ ] 无障碍支持
- [ ] 性能优化
- [ ] 代码分割

---

## 参考资源

- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [React Best Practices](https://react.dev/learn)
- [TanStack Query](https://tanstack.com/query)
- [Prisma Documentation](https://www.prisma.io/docs)
