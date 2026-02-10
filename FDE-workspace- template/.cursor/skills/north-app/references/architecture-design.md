---
name: architecture-design
description: "系统架构设计技能 - 技术选型、架构模式、API规范、数据建模的完整方法论。"
version: 1.0.0
category: development
---

# 系统架构设计

> 好的架构是隐形的 — 它让开发变得简单，让扩展变得自然

---

## 一、架构设计职责

### 核心输出

```yaml
架构文档:
  技术选型: "技术栈决策及理由"
  系统架构: "组件图、数据流图"
  API规范: "OpenAPI/Swagger文档"
  数据模型: "ER图、Schema定义"
  
交付物位置:
  - .claudedocs/architecture.md
  - .claudedocs/api-spec.md (或 openapi.yaml)
  - prisma/schema.prisma (或等效)
```

### 架构师思维模型

```yaml
架构决策三问:
  1. 现在需要什么:
    - 当前业务需求
    - 团队技术能力
    - 时间/资源约束
    
  2. 未来可能需要什么:
    - 业务扩展方向
    - 用户增长预期
    - 技术演进趋势
    
  3. 什么是过度设计:
    - 不确定的需求
    - 可能永远不需要的功能
    - 过早的性能优化

决策原则:
  YAGNI: "You Aren't Gonna Need It - 不要做不需要的事"
  KISS: "Keep It Simple, Stupid - 保持简单"
  渐进式: "从简单开始，按需复杂化"
```

---

## 二、技术选型

### 选型决策框架

```yaml
评估维度:

  1. 团队维度:
    熟悉度:
      权重: 30%
      说明: "团队对技术的掌握程度"
      评分: "1-5分，5=精通"
      
    学习曲线:
      权重: 15%
      说明: "新成员上手时间"
      评分: "1-5分，5=简单"
      
  2. 技术维度:
    成熟度:
      权重: 20%
      说明: "技术稳定性和生产验证"
      评分: "1-5分，5=成熟稳定"
      
    生态系统:
      权重: 15%
      说明: "第三方库、工具、社区支持"
      评分: "1-5分，5=生态完善"
      
  3. 业务维度:
    需求匹配:
      权重: 15%
      说明: "与业务需求的契合度"
      评分: "1-5分，5=完美匹配"
      
    扩展性:
      权重: 5%
      说明: "未来扩展的便利性"
      评分: "1-5分，5=高度灵活"
```

### 技术选型模板

```markdown
## 技术选型决策

### 选型背景
- 项目类型：[Web应用/移动端/后台系统]
- 团队规模：[人数]
- 开发周期：[周数]
- 用户规模：[预期用户量]

### 前端技术栈

| 技术 | 选择 | 备选 | 决策理由 |
|------|------|------|---------|
| 框架 | React 18 | Vue 3 | 团队熟悉度高，生态完善 |
| 构建 | Vite | Webpack | 开发体验好，构建快 |
| 状态 | Zustand | Redux | API简洁，包体积小 |
| UI库 | shadcn/ui | MUI | 可定制性强，无运行时 |
| 样式 | Tailwind | CSS Modules | 开发效率高，一致性好 |

### 后端技术栈

| 技术 | 选择 | 备选 | 决策理由 |
|------|------|------|---------|
| 运行时 | Node.js 20 | Deno | 生态成熟，团队熟悉 |
| 框架 | Express | Fastify | 简单稳定，资源丰富 |
| ORM | Prisma | TypeORM | 类型安全，迁移方便 |
| 验证 | Zod | Joi | TypeScript优先 |

### 数据库

| 用途 | 选择 | 备选 | 决策理由 |
|------|------|------|---------|
| 主库 | PostgreSQL | MySQL | 功能强大，JSON支持好 |
| 缓存 | Redis | Memcached | 功能丰富，持久化支持 |

### 基础设施

| 用途 | 选择 | 备选 | 决策理由 |
|------|------|------|---------|
| 前端托管 | Vercel | Cloudflare Pages | 部署简单，性能好 |
| 后端托管 | Railway | Fly.io | 价格合理，扩展方便 |
| CI/CD | GitHub Actions | GitLab CI | 与仓库集成好 |
```

### 常见技术栈组合

#### 快速原型/MVP

```yaml
目标: "最快速度上线验证想法"
周期: "2-4周"
团队: "1-2人"

技术栈:
  前端: "Next.js + shadcn/ui + Tailwind"
  后端: "Next.js API Routes"
  数据库: "Supabase (PostgreSQL + Auth + Storage)"
  部署: "Vercel"
  
优势:
  - 全栈一体
  - 零配置部署
  - 内置认证
  
劣势:
  - 后端扩展受限
  - 供应商锁定
```

#### 标准Web应用

```yaml
目标: "平衡开发效率和可维护性"
周期: "1-3个月"
团队: "2-5人"

技术栈:
  前端: "React + Vite + Zustand + shadcn/ui"
  后端: "Express + Prisma + PostgreSQL"
  缓存: "Redis"
  部署: "Vercel(前端) + Railway(后端)"
  
优势:
  - 架构清晰
  - 易于维护
  - 扩展性好
  
劣势:
  - 配置较多
  - 部署稍复杂
```

#### 企业级应用

```yaml
目标: "高可用、可扩展、可维护"
周期: "3-6个月"
团队: "5-15人"

技术栈:
  前端: "Next.js App Router + TanStack Query"
  后端: "NestJS + Prisma + PostgreSQL"
  消息队列: "BullMQ + Redis"
  搜索: "Meilisearch"
  监控: "Sentry + Datadog"
  部署: "Docker + Kubernetes"
  
优势:
  - 企业级特性
  - 高可用架构
  - 完善监控
  
劣势:
  - 复杂度高
  - 运维成本高
```

---

## 三、架构模式

### 单体架构

```yaml
定义: "所有功能在一个代码库、一个部署单元"

结构:
  app/
  ├── api/            # API层
  ├── services/       # 业务逻辑层
  ├── repositories/   # 数据访问层
  ├── models/         # 数据模型
  └── utils/          # 工具函数

适用场景:
  - 小团队（≤5人）
  - 快速迭代
  - 业务简单明确
  - MVP阶段

优势:
  - 开发简单
  - 部署容易
  - 调试方便
  - 事务简单

劣势:
  - 扩展受限
  - 技术债务易累积
  - 单点故障
```

### 模块化单体

```yaml
定义: "单体架构 + 明确的模块边界"

结构:
  app/
  ├── modules/
  │   ├── auth/           # 认证模块
  │   │   ├── api/
  │   │   ├── services/
  │   │   └── models/
  │   ├── users/          # 用户模块
  │   │   ├── api/
  │   │   ├── services/
  │   │   └── models/
  │   └── todos/          # 待办模块
  │       ├── api/
  │       ├── services/
  │       └── models/
  ├── shared/             # 共享代码
  └── infrastructure/     # 基础设施

模块原则:
  - 模块间通过明确接口通信
  - 禁止跨模块直接数据库访问
  - 每个模块可独立测试
  - 未来可拆分为微服务

适用场景:
  - 中型团队（5-15人）
  - 业务有明确边界
  - 预期需要扩展
```

### 微服务架构

```yaml
定义: "将应用拆分为独立部署的服务"

结构:
  services/
  ├── api-gateway/        # API网关
  ├── auth-service/       # 认证服务
  ├── user-service/       # 用户服务
  ├── todo-service/       # 待办服务
  └── notification-service/ # 通知服务

通信方式:
  同步: "REST/gRPC"
  异步: "消息队列(RabbitMQ/Kafka)"

适用场景:
  - 大型团队（>15人）
  - 多团队独立开发
  - 高可用要求
  - 独立扩展需求

优势:
  - 独立部署
  - 技术异构
  - 故障隔离
  - 弹性扩展

劣势:
  - 分布式复杂度
  - 运维成本高
  - 数据一致性挑战
```

### 架构图示例

```
┌─────────────────────────────────────────────────────────────────┐
│                        客户端层                                  │
│                                                                 │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐                     │
│   │ Web App  │  │ Mobile   │  │  Admin   │                     │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘                     │
│        │             │             │                            │
│        └─────────────┴─────────────┘                            │
│                      │                                          │
├──────────────────────┼──────────────────────────────────────────┤
│                      ▼                                          │
│              ┌───────────────┐                                  │
│              │   API网关     │     ← 认证、限流、路由           │
│              │  (Nginx/Kong) │                                  │
│              └───────┬───────┘                                  │
│                      │                                          │
├──────────────────────┼──────────────────────────────────────────┤
│                      ▼                    应用层                │
│   ┌──────────────────────────────────────────────────────┐     │
│   │                    后端API                            │     │
│   │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │     │
│   │  │  Auth   │ │  Users  │ │  Todos  │ │  ...    │   │     │
│   │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘   │     │
│   │       │           │           │           │         │     │
│   │       └───────────┴───────────┴───────────┘         │     │
│   │                           │                          │     │
│   └───────────────────────────┼──────────────────────────┘     │
│                               │                                 │
├───────────────────────────────┼─────────────────────────────────┤
│                               ▼                  数据层         │
│   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐   │
│   │  PostgreSQL   │   │    Redis      │   │  S3/MinIO     │   │
│   │   (主数据库)   │   │   (缓存)      │   │ (文件存储)    │   │
│   └───────────────┘   └───────────────┘   └───────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 四、API设计规范

### RESTful设计原则

```yaml
URL设计:
  资源命名:
    ✅ 正确: "/users", "/todos", "/projects"
    ❌ 错误: "/getUsers", "/user_list", "/Users"
    
  层级关系:
    ✅ 正确: "/users/123/todos"
    ❌ 错误: "/getUserTodos?userId=123"
    
  查询参数:
    分页: "?page=1&limit=20"
    筛选: "?status=active&priority=high"
    排序: "?sort=-createdAt" (负号表示降序)
    搜索: "?search=keyword"

HTTP方法:
  GET:
    用途: "获取资源"
    幂等: true
    安全: true
    示例: "GET /todos"
    
  POST:
    用途: "创建资源"
    幂等: false
    安全: false
    示例: "POST /todos"
    
  PUT:
    用途: "完整更新"
    幂等: true
    安全: false
    示例: "PUT /todos/123"
    
  PATCH:
    用途: "部分更新"
    幂等: true
    安全: false
    示例: "PATCH /todos/123"
    
  DELETE:
    用途: "删除资源"
    幂等: true
    安全: false
    示例: "DELETE /todos/123"
```

### 响应格式规范

```typescript
// 成功响应 - 单个资源
interface SuccessResponse<T> {
  data: T;
}

// 成功响应 - 列表
interface ListResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 错误响应
interface ErrorResponse {
  error: {
    code: string;        // 错误码 (如 "VALIDATION_ERROR")
    message: string;     // 用户友好的错误信息
    details?: Array<{    // 详细错误（如表单验证）
      field: string;
      message: string;
    }>;
    requestId?: string;  // 请求ID，用于追踪
  };
}

// 示例
// GET /todos 成功
{
  "data": [
    { "id": "1", "title": "学习TypeScript", "completed": false }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}

// POST /todos 验证失败
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "请求数据验证失败",
    "details": [
      { "field": "title", "message": "标题不能为空" },
      { "field": "priority", "message": "优先级必须在0-3之间" }
    ],
    "requestId": "req_abc123"
  }
}
```

### HTTP状态码规范

```yaml
2xx 成功:
  200 OK: "请求成功（GET、PUT、PATCH、DELETE）"
  201 Created: "资源创建成功（POST）"
  204 No Content: "成功但无返回内容（DELETE）"

4xx 客户端错误:
  400 Bad Request: "请求格式错误、验证失败"
  401 Unauthorized: "未认证"
  403 Forbidden: "无权限"
  404 Not Found: "资源不存在"
  409 Conflict: "资源冲突（如重复创建）"
  422 Unprocessable Entity: "语义错误（如业务规则违反）"
  429 Too Many Requests: "请求频率超限"

5xx 服务端错误:
  500 Internal Server Error: "服务器内部错误"
  502 Bad Gateway: "网关错误"
  503 Service Unavailable: "服务不可用"
```

### API版本管理

```yaml
版本策略:
  URL版本:
    格式: "/api/v1/todos"
    优势: "清晰明确，易于路由"
    劣势: "URL变长"
    推荐: true
    
  Header版本:
    格式: "Accept: application/vnd.api+json;version=1"
    优势: "URL简洁"
    劣势: "不够直观"
    推荐: false

版本迁移:
  1. 新版本与旧版本并行运行
  2. 旧版本标记为deprecated
  3. 给客户端迁移时间（通常3-6个月）
  4. 下线旧版本前提前通知
```

### OpenAPI规范示例

```yaml
# openapi.yaml
openapi: 3.0.3
info:
  title: Todo API
  version: 1.0.0
  description: 待办事项管理API

servers:
  - url: http://localhost:3000/api/v1
    description: 开发环境

paths:
  /todos:
    get:
      summary: 获取待办列表
      tags: [Todos]
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
        - name: status
          in: query
          schema:
            type: string
            enum: [all, active, completed]
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TodoListResponse'
    
    post:
      summary: 创建待办
      tags: [Todos]
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateTodoInput'
      responses:
        '201':
          description: 创建成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TodoResponse'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    Todo:
      type: object
      properties:
        id:
          type: string
          format: uuid
        title:
          type: string
        completed:
          type: boolean
        createdAt:
          type: string
          format: date-time
      required:
        - id
        - title
        - completed
        - createdAt

    CreateTodoInput:
      type: object
      properties:
        title:
          type: string
          minLength: 1
          maxLength: 255
        description:
          type: string
        priority:
          type: integer
          minimum: 0
          maximum: 3
      required:
        - title
```

---

## 五、数据模型设计

### 实体设计原则

```yaml
命名规范:
  表名:
    格式: "复数形式，snake_case"
    示例: "users, todos, user_profiles"
    
  字段名:
    格式: "snake_case"
    示例: "created_at, user_id, is_active"
    
  主键:
    推荐: "id (UUID或自增)"
    避免: "复合主键（除非必要）"
    
必备字段:
  主键: "id"
  审计: "created_at, updated_at"
  软删除: "deleted_at (可选)"
```

### Prisma Schema示例

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 用户表
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // bcrypt hash
  name      String
  avatar    String?
  role      UserRole @default(USER)
  
  // 审计字段
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  // 关系
  todos     Todo[]
  
  @@map("users")
}

enum UserRole {
  USER
  ADMIN
}

// 待办事项表
model Todo {
  id          String    @id @default(uuid())
  title       String
  description String?
  priority    Int       @default(0)
  completed   Boolean   @default(false)
  completedAt DateTime? @map("completed_at")
  dueDate     DateTime? @map("due_date")
  
  // 外键
  userId      String    @map("user_id")
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // 审计字段
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  
  // 索引
  @@index([userId])
  @@index([completed])
  @@index([dueDate])
  
  @@map("todos")
}

// 标签表
model Tag {
  id    String @id @default(uuid())
  name  String @unique
  color String @default("#6B7280")
  
  // 多对多关系
  todos TodoTag[]
  
  @@map("tags")
}

// 待办-标签关联表
model TodoTag {
  todoId String @map("todo_id")
  tagId  String @map("tag_id")
  
  todo   Todo   @relation(fields: [todoId], references: [id], onDelete: Cascade)
  tag    Tag    @relation(fields: [tagId], references: [id], onDelete: Cascade)
  
  @@id([todoId, tagId])
  @@map("todo_tags")
}
```

### 索引策略

```yaml
索引原则:
  必须索引:
    - 主键（自动）
    - 外键
    - 唯一约束字段
    
  应该索引:
    - 高频查询条件
    - 排序字段
    - 关联查询字段
    
  避免索引:
    - 低基数字段（如性别）
    - 频繁更新的字段
    - 大文本字段

复合索引:
  原则: "最左前缀原则"
  示例: "INDEX (user_id, created_at) 可用于：
         - WHERE user_id = ?
         - WHERE user_id = ? AND created_at > ?
         - 但不能用于 WHERE created_at > ?"
```

---

## 六、架构检查清单

### 技术选型

- [ ] 团队熟悉度评估完成
- [ ] 技术成熟度调研完成
- [ ] 性能需求分析完成
- [ ] 备选方案对比完成
- [ ] 决策文档已记录

### 架构设计

- [ ] 架构模式已选择
- [ ] 组件划分合理
- [ ] 数据流清晰
- [ ] 扩展性考虑
- [ ] 架构图已绘制

### API设计

- [ ] RESTful规范遵循
- [ ] 响应格式统一
- [ ] 错误处理规范
- [ ] 认证授权设计
- [ ] API文档完成

### 数据建模

- [ ] 实体定义完整
- [ ] 关系设计合理
- [ ] 索引策略明确
- [ ] Schema文件已创建

---

## 参考资源

- [12-Factor App](https://12factor.net/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [RESTful API Design](https://restfulapi.net/)
- [Prisma Documentation](https://www.prisma.io/docs)
