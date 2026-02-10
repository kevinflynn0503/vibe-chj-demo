---
name: testing-engineering
description: "测试工程技能 - 测试策略、TDD实践、单元/集成/E2E测试、代码质量保障的完整方法论。"
version: 1.0.0
category: development
---

# 测试工程

> 没有测试的代码是不完整的 — 测试是代码质量的守护者

---

## 一、测试职责

### 核心职责

```yaml
测试编写:
  - 单元测试（组件、函数、服务）
  - 集成测试（API、数据库）
  - E2E测试（用户流程）
  - 性能测试（可选）
  
缺陷修复:
  - 发现测试失败
  - 定位问题原因
  - 修复代码缺陷
  - 验证修复结果
  
质量保障:
  - 测试覆盖率≥80%
  - 所有测试通过
  - TDD迭代优化
  - 输出测试报告
```

### TDD工作流

```
┌─────────────────────────────────────────────────────────────────┐
│                      TDD循环（红-绿-重构）                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   1. 红（Red）         2. 绿（Green）       3. 重构（Refactor） │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     │
│   │             │     │             │     │             │     │
│   │  编写测试   │────▶│  编写代码   │────▶│  重构代码   │     │
│   │  (测试失败) │     │  (测试通过) │     │  (保持绿色) │     │
│   │             │     │             │     │             │     │
│   └─────────────┘     └─────────────┘     └──────┬──────┘     │
│         ▲                                        │             │
│         │                                        │             │
│         └────────────────────────────────────────┘             │
│                       持续迭代                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 二、测试金字塔

### 测试层级

```
                    ┌─────────┐
                    │  E2E   │  10%
                    │  测试   │  验证用户流程
                   ┌┴─────────┴┐
                   │   集成    │  20%
                   │   测试    │  验证模块交互
                  ┌┴───────────┴┐
                  │    单元     │  70%
                  │    测试     │  验证最小单元
                  └─────────────┘
```

### 各层级说明

```yaml
单元测试:
  定义: "测试最小可测试单元（函数、类、组件）"
  特点:
    - 运行快速（毫秒级）
    - 隔离依赖（使用mock）
    - 覆盖率高
  覆盖: "70%的测试用例"
  工具: "Jest, Vitest, Testing Library"

集成测试:
  定义: "测试多个单元的协作"
  特点:
    - 测试真实交互
    - 使用测试数据库
    - 运行较慢（秒级）
  覆盖: "20%的测试用例"
  工具: "Supertest, Testcontainers"

E2E测试:
  定义: "测试完整用户流程"
  特点:
    - 模拟真实用户
    - 端到端验证
    - 运行最慢（分钟级）
  覆盖: "10%的测试用例"
  工具: "Playwright, Cypress, Maestro"
```

---

## 三、单元测试

### 测试框架配置

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'tests/**',
        '**/*.d.ts',
        '**/*.config.*',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 测试文件结构

```
tests/
├── unit/                       # 单元测试
│   ├── services/
│   │   ├── todo.service.test.ts
│   │   └── auth.service.test.ts
│   ├── utils/
│   │   └── format.test.ts
│   └── components/
│       ├── TodoList.test.tsx
│       └── TodoItem.test.tsx
│
├── integration/                # 集成测试
│   ├── api/
│   │   ├── todos.test.ts
│   │   └── auth.test.ts
│   └── db/
│       └── user.repository.test.ts
│
├── e2e/                        # E2E测试
│   ├── auth.spec.ts
│   └── todos.spec.ts
│
├── fixtures/                   # 测试数据
│   ├── users.ts
│   └── todos.ts
│
├── mocks/                      # Mock数据
│   ├── handlers.ts
│   └── server.ts
│
└── setup.ts                    # 测试配置
```

### 单元测试示例

#### 服务测试

```typescript
// tests/unit/services/todo.service.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { todoService } from '@/services/todo.service';
import { prisma } from '@/lib/prisma';
import { NotFoundError, ForbiddenError } from '@/lib/errors';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    todo: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe('TodoService', () => {
  const mockUserId = 'user-123';
  const mockTodo = {
    id: 'todo-1',
    title: '测试待办',
    description: null,
    completed: false,
    priority: 0,
    userId: mockUserId,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findById', () => {
    it('应该返回待办事项', async () => {
      // Arrange
      vi.mocked(prisma.todo.findUnique).mockResolvedValue(mockTodo);

      // Act
      const result = await todoService.findById('todo-1', mockUserId);

      // Assert
      expect(result).toEqual(mockTodo);
      expect(prisma.todo.findUnique).toHaveBeenCalledWith({
        where: { id: 'todo-1' },
      });
    });

    it('待办不存在时应该抛出NotFoundError', async () => {
      // Arrange
      vi.mocked(prisma.todo.findUnique).mockResolvedValue(null);

      // Act & Assert
      await expect(
        todoService.findById('not-exist', mockUserId)
      ).rejects.toThrow(NotFoundError);
    });

    it('无权限时应该抛出ForbiddenError', async () => {
      // Arrange
      vi.mocked(prisma.todo.findUnique).mockResolvedValue(mockTodo);

      // Act & Assert
      await expect(
        todoService.findById('todo-1', 'other-user')
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('create', () => {
    it('应该创建待办并返回', async () => {
      // Arrange
      const input = {
        title: '新待办',
        userId: mockUserId,
      };
      const created = { ...mockTodo, ...input };
      vi.mocked(prisma.todo.create).mockResolvedValue(created);

      // Act
      const result = await todoService.create(input);

      // Assert
      expect(result).toEqual(created);
      expect(prisma.todo.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: '新待办',
          userId: mockUserId,
        }),
      });
    });
  });

  describe('update', () => {
    it('应该更新待办并返回', async () => {
      // Arrange
      vi.mocked(prisma.todo.findUnique).mockResolvedValue(mockTodo);
      const updated = { ...mockTodo, title: '更新后的标题' };
      vi.mocked(prisma.todo.update).mockResolvedValue(updated);

      // Act
      const result = await todoService.update(
        'todo-1',
        mockUserId,
        { title: '更新后的标题' }
      );

      // Assert
      expect(result.title).toBe('更新后的标题');
    });

    it('完成待办时应该设置completedAt', async () => {
      // Arrange
      vi.mocked(prisma.todo.findUnique).mockResolvedValue(mockTodo);
      const completedTodo = {
        ...mockTodo,
        completed: true,
        completedAt: new Date(),
      };
      vi.mocked(prisma.todo.update).mockResolvedValue(completedTodo);

      // Act
      await todoService.update('todo-1', mockUserId, { completed: true });

      // Assert
      expect(prisma.todo.update).toHaveBeenCalledWith({
        where: { id: 'todo-1' },
        data: expect.objectContaining({
          completed: true,
          completedAt: expect.any(Date),
        }),
      });
    });
  });
});
```

#### 组件测试

```typescript
// tests/unit/components/TodoList.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TodoList } from '@/components/features/todos/TodoList';
import { server } from '@/tests/mocks/server';
import { rest } from 'msw';

// 创建测试用QueryClient
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

// 包装器
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('TodoList', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it('应该显示待办列表', async () => {
    // Arrange - 默认使用mock server的数据

    // Act
    render(<TodoList />, { wrapper });

    // Assert
    await waitFor(() => {
      expect(screen.getByText('测试待办1')).toBeInTheDocument();
      expect(screen.getByText('测试待办2')).toBeInTheDocument();
    });
  });

  it('加载中应该显示骨架屏', () => {
    // Act
    render(<TodoList />, { wrapper });

    // Assert
    expect(screen.getByTestId('todo-skeleton')).toBeInTheDocument();
  });

  it('应该能添加新待办', async () => {
    // Arrange
    render(<TodoList />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText('测试待办1')).toBeInTheDocument();
    });

    // Act
    const input = screen.getByPlaceholderText('添加新待办...');
    const button = screen.getByRole('button', { name: '添加' });

    fireEvent.change(input, { target: { value: '新的待办事项' } });
    fireEvent.click(button);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('新的待办事项')).toBeInTheDocument();
    });
  });

  it('API错误时应该显示错误信息', async () => {
    // Arrange - 模拟API错误
    server.use(
      rest.get('/api/v1/todos', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: { message: '服务器错误' } }));
      })
    );

    // Act
    render(<TodoList />, { wrapper });

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/加载失败/)).toBeInTheDocument();
    });
  });

  it('空列表应该显示空状态', async () => {
    // Arrange
    server.use(
      rest.get('/api/v1/todos', (req, res, ctx) => {
        return res(
          ctx.json({
            data: [],
            meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
          })
        );
      })
    );

    // Act
    render(<TodoList />, { wrapper });

    // Assert
    await waitFor(() => {
      expect(screen.getByText('暂无待办')).toBeInTheDocument();
    });
  });

  it('应该能切换筛选状态', async () => {
    // Arrange
    render(<TodoList />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText('测试待办1')).toBeInTheDocument();
    });

    // Act
    const activeButton = screen.getByRole('button', { name: '进行中' });
    fireEvent.click(activeButton);

    // Assert
    await waitFor(() => {
      expect(activeButton).toHaveClass('bg-primary');
    });
  });
});
```

#### Hook测试

```typescript
// tests/unit/hooks/useTodos.test.ts

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach } from 'vitest';
import { useTodos, useCreateTodo } from '@/hooks/useTodos';
import { server } from '@/tests/mocks/server';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useTodos', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it('应该获取待办列表', async () => {
    // Act
    const { result } = renderHook(() => useTodos(), {
      wrapper: createWrapper(),
    });

    // Assert
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toHaveLength(2);
    expect(result.current.data?.data[0].title).toBe('测试待办1');
  });

  it('应该支持分页参数', async () => {
    // Act
    const { result } = renderHook(
      () => useTodos({ page: 2, limit: 10 }),
      { wrapper: createWrapper() }
    );

    // Assert
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe('useCreateTodo', () => {
  it('应该创建待办', async () => {
    // Arrange
    const { result } = renderHook(() => useCreateTodo(), {
      wrapper: createWrapper(),
    });

    // Act
    result.current.mutate({ title: '新待办' });

    // Assert
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data?.title).toBe('新待办');
  });
});
```

---

## 四、集成测试

### API集成测试

```typescript
// tests/integration/api/todos.test.ts

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '@/app';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/jwt';

describe('Todos API', () => {
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    // 创建测试用户
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashed_password',
        name: 'Test User',
      },
    });
    testUserId = user.id;
    authToken = generateToken({ userId: user.id, email: user.email });
  });

  afterAll(async () => {
    // 清理测试数据
    await prisma.todo.deleteMany({ where: { userId: testUserId } });
    await prisma.user.delete({ where: { id: testUserId } });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // 每个测试前清理待办数据
    await prisma.todo.deleteMany({ where: { userId: testUserId } });
  });

  describe('GET /api/v1/todos', () => {
    it('应该返回待办列表', async () => {
      // Arrange
      await prisma.todo.createMany({
        data: [
          { title: '待办1', userId: testUserId },
          { title: '待办2', userId: testUserId },
        ],
      });

      // Act
      const response = await request(app)
        .get('/api/v1/todos')
        .set('Authorization', `Bearer ${authToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta.total).toBe(2);
    });

    it('未认证时应该返回401', async () => {
      // Act
      const response = await request(app).get('/api/v1/todos');

      // Assert
      expect(response.status).toBe(401);
    });

    it('应该支持分页', async () => {
      // Arrange
      const todos = Array.from({ length: 25 }, (_, i) => ({
        title: `待办${i + 1}`,
        userId: testUserId,
      }));
      await prisma.todo.createMany({ data: todos });

      // Act
      const response = await request(app)
        .get('/api/v1/todos?page=2&limit=10')
        .set('Authorization', `Bearer ${authToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(10);
      expect(response.body.meta.page).toBe(2);
      expect(response.body.meta.totalPages).toBe(3);
    });
  });

  describe('POST /api/v1/todos', () => {
    it('应该创建待办', async () => {
      // Act
      const response = await request(app)
        .post('/api/v1/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: '新待办', priority: 1 });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.data.title).toBe('新待办');
      expect(response.body.data.priority).toBe(1);
      expect(response.body.data.completed).toBe(false);
    });

    it('标题为空时应该返回400', async () => {
      // Act
      const response = await request(app)
        .post('/api/v1/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: '' });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PATCH /api/v1/todos/:id', () => {
    it('应该更新待办', async () => {
      // Arrange
      const todo = await prisma.todo.create({
        data: { title: '原标题', userId: testUserId },
      });

      // Act
      const response = await request(app)
        .patch(`/api/v1/todos/${todo.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: '新标题', completed: true });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe('新标题');
      expect(response.body.data.completed).toBe(true);
      expect(response.body.data.completedAt).not.toBeNull();
    });

    it('待办不存在时应该返回404', async () => {
      // Act
      const response = await request(app)
        .patch('/api/v1/todos/not-exist-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: '新标题' });

      // Assert
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/todos/:id', () => {
    it('应该删除待办', async () => {
      // Arrange
      const todo = await prisma.todo.create({
        data: { title: '待删除', userId: testUserId },
      });

      // Act
      const response = await request(app)
        .delete(`/api/v1/todos/${todo.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      // Assert
      expect(response.status).toBe(204);

      // 验证已删除
      const deleted = await prisma.todo.findUnique({ where: { id: todo.id } });
      expect(deleted).toBeNull();
    });
  });
});
```

---

## 五、E2E测试

### Playwright配置

```typescript
// playwright.config.ts

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E测试示例

```typescript
// tests/e2e/todos.spec.ts

import { test, expect } from '@playwright/test';

test.describe('待办事项功能', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // 等待跳转到仪表板
    await page.waitForURL('/dashboard');
  });

  test('用户可以查看待办列表', async ({ page }) => {
    // 导航到待办页面
    await page.goto('/todos');

    // 验证页面标题
    await expect(page.locator('h1')).toContainText('待办事项');

    // 验证列表存在
    await expect(page.locator('[data-testid="todo-list"]')).toBeVisible();
  });

  test('用户可以创建待办事项', async ({ page }) => {
    await page.goto('/todos');

    // 填写表单
    await page.fill('[placeholder="添加新待办..."]', '购买生日礼物');
    await page.click('button:has-text("添加")');

    // 验证创建成功
    await expect(page.locator('text=购买生日礼物')).toBeVisible();
  });

  test('用户可以完成待办事项', async ({ page }) => {
    await page.goto('/todos');

    // 等待列表加载
    await page.waitForSelector('[data-testid="todo-item"]');

    // 点击第一个待办的完成按钮
    await page.click('[data-testid="todo-item"]:first-child [aria-label="完成"]');

    // 验证状态变化
    await expect(
      page.locator('[data-testid="todo-item"]:first-child')
    ).toHaveClass(/completed/);
  });

  test('用户可以删除待办事项', async ({ page }) => {
    await page.goto('/todos');

    // 等待列表加载
    await page.waitForSelector('[data-testid="todo-item"]');
    const initialCount = await page.locator('[data-testid="todo-item"]').count();

    // 点击删除按钮
    await page.click('[data-testid="todo-item"]:first-child [aria-label="删除"]');

    // 确认删除
    await page.click('button:has-text("确认")');

    // 验证数量减少
    await expect(page.locator('[data-testid="todo-item"]')).toHaveCount(initialCount - 1);
  });

  test('用户可以筛选待办事项', async ({ page }) => {
    await page.goto('/todos');

    // 点击"进行中"筛选
    await page.click('button:has-text("进行中")');

    // 验证URL包含筛选参数
    await expect(page).toHaveURL(/status=active/);

    // 验证只显示未完成的待办
    const completedItems = await page.locator('[data-testid="todo-item"].completed').count();
    expect(completedItems).toBe(0);
  });

  test('用户可以编辑待办事项', async ({ page }) => {
    await page.goto('/todos');

    // 点击第一个待办进入详情
    await page.click('[data-testid="todo-item"]:first-child');

    // 等待详情页加载
    await page.waitForURL(/\/todos\/\w+/);

    // 修改标题
    await page.fill('[name="title"]', '修改后的标题');
    await page.click('button:has-text("保存")');

    // 验证保存成功提示
    await expect(page.locator('text=保存成功')).toBeVisible();
  });
});

test.describe('认证流程', () => {
  test('用户可以注册新账号', async ({ page }) => {
    await page.goto('/register');

    await page.fill('[name="name"]', 'New User');
    await page.fill('[name="email"]', 'newuser@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.fill('[name="confirmPassword"]', 'password123');
    await page.click('button[type="submit"]');

    // 验证跳转到登录页或仪表板
    await expect(page).toHaveURL(/\/(login|dashboard)/);
  });

  test('未登录用户访问受保护页面应跳转到登录', async ({ page }) => {
    // 直接访问待办页面
    await page.goto('/todos');

    // 应该跳转到登录页
    await expect(page).toHaveURL(/\/login/);
  });

  test('用户可以登出', async ({ page }) => {
    // 先登录
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // 点击登出
    await page.click('[aria-label="用户菜单"]');
    await page.click('text=退出登录');

    // 验证跳转到登录页
    await expect(page).toHaveURL(/\/login/);
  });
});
```

---

## 六、测试工具配置

### Mock Server (MSW)

```typescript
// tests/mocks/handlers.ts

import { rest } from 'msw';

const API_URL = 'http://localhost:3000/api/v1';

export const handlers = [
  // 获取待办列表
  rest.get(`${API_URL}/todos`, (req, res, ctx) => {
    return res(
      ctx.json({
        data: [
          {
            id: 'todo-1',
            title: '测试待办1',
            completed: false,
            createdAt: '2024-01-01T00:00:00Z',
          },
          {
            id: 'todo-2',
            title: '测试待办2',
            completed: true,
            createdAt: '2024-01-02T00:00:00Z',
          },
        ],
        meta: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
        },
      })
    );
  }),

  // 创建待办
  rest.post(`${API_URL}/todos`, async (req, res, ctx) => {
    const body = await req.json();
    return res(
      ctx.status(201),
      ctx.json({
        data: {
          id: 'todo-new',
          ...body,
          completed: false,
          createdAt: new Date().toISOString(),
        },
      })
    );
  }),

  // 更新待办
  rest.patch(`${API_URL}/todos/:id`, async (req, res, ctx) => {
    const { id } = req.params;
    const body = await req.json();
    return res(
      ctx.json({
        data: {
          id,
          title: '测试待办1',
          ...body,
          updatedAt: new Date().toISOString(),
        },
      })
    );
  }),

  // 删除待办
  rest.delete(`${API_URL}/todos/:id`, (req, res, ctx) => {
    return res(ctx.status(204));
  }),
];

// tests/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### 测试设置文件

```typescript
// tests/setup.ts

import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';
import '@testing-library/jest-dom/vitest';

// 启动Mock Server
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// 每个测试后重置handlers
afterEach(() => server.resetHandlers());

// 所有测试完成后关闭
afterAll(() => server.close());
```

---

## 七、测试覆盖率要求

### 覆盖率目标

```yaml
总体目标:
  行覆盖率: "≥80%"
  函数覆盖率: "≥80%"
  分支覆盖率: "≥80%"
  语句覆盖率: "≥80%"

分模块要求:
  核心业务逻辑: "≥90%"
  API端点: "≥85%"
  UI组件: "≥75%"
  工具函数: "≥90%"

豁免范围:
  - 配置文件
  - 类型定义文件
  - 测试文件本身
  - 第三方库包装
```

### CI集成

```yaml
# .github/workflows/test.yml

name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit -- --coverage

      - name: Run integration tests
        run: npm run test:integration

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true
          
  e2e:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright
        run: npx playwright install --with-deps
        
      - name: Run E2E tests
        run: npm run test:e2e
        
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 八、检查清单

### 单元测试

- [ ] 所有服务类有测试
- [ ] 所有工具函数有测试
- [ ] 核心组件有测试
- [ ] 自定义Hooks有测试
- [ ] Mock正确设置

### 集成测试

- [ ] 所有API端点有测试
- [ ] 认证流程有测试
- [ ] 数据库操作有测试
- [ ] 错误场景有测试

### E2E测试

- [ ] 核心用户流程有测试
- [ ] 认证流程有测试
- [ ] 跨浏览器测试
- [ ] 移动端测试

### 质量指标

- [ ] 覆盖率≥80%
- [ ] 所有测试通过
- [ ] 无跳过的测试
- [ ] CI集成配置完成

---

## 参考资源

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [MSW Documentation](https://mswjs.io/)
