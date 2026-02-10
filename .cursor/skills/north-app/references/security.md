# 安全开发指南

## 概述

本指南涵盖Web和移动端应用的安全开发实践。

---

## 身份认证

### 1. 密码处理

```typescript
// ❌ 明文存储密码
user.password = input.password;

// ✅ 使用bcrypt哈希密码
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// 使用
const hashedPassword = await hashPassword(input.password);
user.password = hashedPassword;
```

### 2. JWT处理

```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = '7d';

// 生成Token
function generateToken(userId: string): string {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// 验证Token
function verifyToken(token: string): { userId: string } {
  return jwt.verify(token, JWT_SECRET) as { userId: string };
}

// ✅ 使用HttpOnly Cookie存储Token
res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

### 3. Session管理

```typescript
// ✅ 实现Token轮换
async function refreshToken(oldToken: string): Promise<string> {
  // 验证旧Token
  const payload = verifyToken(oldToken);
  
  // 检查Token是否在黑名单
  if (await isTokenBlacklisted(oldToken)) {
    throw new UnauthorizedError('Token已失效');
  }
  
  // 将旧Token加入黑名单
  await blacklistToken(oldToken);
  
  // 生成新Token
  return generateToken(payload.userId);
}
```

---

## 输入验证

### 1. 验证框架

```typescript
import { z } from 'zod';

// 定义验证Schema
const createUserSchema = z.object({
  email: z.string().email('无效的邮箱格式'),
  password: z.string()
    .min(8, '密码至少8位')
    .regex(/[A-Z]/, '密码需包含大写字母')
    .regex(/[a-z]/, '密码需包含小写字母')
    .regex(/[0-9]/, '密码需包含数字'),
  name: z.string()
    .min(2, '名称至少2个字符')
    .max(50, '名称最多50个字符'),
});

// 验证函数
function validateInput<T>(schema: z.Schema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    throw new ValidationError(result.error.issues);
  }
  
  return result.data;
}

// 使用
app.post('/api/users', (req, res) => {
  const input = validateInput(createUserSchema, req.body);
  // input 类型安全且已验证
});
```

### 2. 防止SQL注入

```typescript
// ❌ 字符串拼接SQL
const users = await db.query(`SELECT * FROM users WHERE email = '${email}'`);

// ✅ 使用参数化查询
const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);

// ✅ 使用ORM
const users = await prisma.user.findMany({
  where: { email },
});
```

### 3. 防止XSS

```typescript
// ❌ 直接渲染用户输入
function Comment({ content }) {
  return <div dangerouslySetInnerHTML={{ __html: content }} />;
}

// ✅ 默认转义（React自动处理）
function Comment({ content }) {
  return <div>{content}</div>;
}

// ✅ 如必须渲染HTML，使用sanitize
import DOMPurify from 'dompurify';

function RichContent({ html }) {
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p'],
    ALLOWED_ATTR: ['href'],
  });
  
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

---

## 授权控制

### 1. RBAC实现

```typescript
// 定义角色和权限
const ROLES = {
  admin: ['users:read', 'users:write', 'todos:read', 'todos:write', 'todos:delete'],
  user: ['todos:read', 'todos:write'],
  viewer: ['todos:read'],
} as const;

type Role = keyof typeof ROLES;
type Permission = typeof ROLES[Role][number];

// 检查权限
function hasPermission(userRole: Role, permission: Permission): boolean {
  return ROLES[userRole].includes(permission);
}

// 中间件
function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    
    if (!user || !hasPermission(user.role, permission)) {
      throw new ForbiddenError('权限不足');
    }
    
    next();
  };
}

// 使用
app.delete('/api/todos/:id', requirePermission('todos:delete'), deleteTodo);
```

### 2. 资源所有权检查

```typescript
// ✅ 确保用户只能访问自己的资源
async function getTodo(id: string, userId: string): Promise<Todo> {
  const todo = await prisma.todo.findUnique({
    where: { id },
  });

  if (!todo) {
    throw new NotFoundError('Todo不存在');
  }

  // 检查所有权
  if (todo.userId !== userId) {
    throw new ForbiddenError('无权访问此资源');
  }

  return todo;
}
```

---

## API安全

### 1. Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

// 全局限流
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15分钟
  max: 100,                   // 每个IP最多100次请求
  message: '请求过于频繁，请稍后再试',
});

app.use(limiter);

// 登录接口更严格的限流
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1小时
  max: 5,                      // 每个IP最多5次失败
  message: '登录尝试次数过多，请稍后再试',
});

app.post('/api/auth/login', loginLimiter, login);
```

### 2. CORS配置

```typescript
import cors from 'cors';

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,  // 预检请求缓存24小时
};

app.use(cors(corsOptions));
```

### 3. 安全Headers

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
  },
}));
```

---

## 敏感数据保护

### 1. 环境变量管理

```typescript
// ❌ 硬编码敏感信息
const JWT_SECRET = 'my-secret-key';

// ✅ 使用环境变量
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

// .env.example（提交到代码库）
// JWT_SECRET=your-secret-key-here
// DATABASE_URL=postgresql://...

// .env（不提交）
// JWT_SECRET=actual-secret-key
// DATABASE_URL=postgresql://user:pass@localhost/db
```

### 2. 日志脱敏

```typescript
// ❌ 记录敏感信息
logger.info('User login', { email, password });

// ✅ 脱敏处理
function maskSensitive(data: Record<string, any>): Record<string, any> {
  const sensitiveFields = ['password', 'token', 'secret', 'creditCard'];
  
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      sensitiveFields.some(f => key.toLowerCase().includes(f))
        ? '***REDACTED***'
        : value,
    ])
  );
}

logger.info('User login', maskSensitive({ email, password }));
// 输出: { email: 'user@example.com', password: '***REDACTED***' }
```

### 3. 加密敏感数据

```typescript
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!; // 32字节
const IV_LENGTH = 16;

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
  const [ivHex, encryptedHex] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
```

---

## 错误处理

### 1. 安全的错误响应

```typescript
// ❌ 暴露敏感信息
app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack,        // 暴露堆栈
    query: req.query,        // 暴露请求
  });
});

// ✅ 安全的错误处理
app.use((err, req, res, next) => {
  // 记录完整错误到日志（不暴露给用户）
  logger.error(err);

  // 返回安全的错误响应
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 
    ? '服务器内部错误' 
    : err.message;

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});
```

---

## 安全检查清单

### 开发阶段

- [ ] 使用HTTPS
- [ ] 密码哈希存储
- [ ] 输入验证
- [ ] 参数化查询
- [ ] 输出转义
- [ ] CSRF保护
- [ ] 安全的Session管理

### 部署阶段

- [ ] 环境变量配置
- [ ] 日志脱敏
- [ ] 错误处理
- [ ] Rate Limiting
- [ ] CORS配置
- [ ] 安全Headers

### 持续维护

- [ ] 依赖更新
- [ ] 安全扫描
- [ ] 渗透测试
- [ ] 安全培训

---

## 常见漏洞

| 漏洞 | 风险 | 防护 |
|------|------|------|
| SQL注入 | 数据泄露/篡改 | 参数化查询 |
| XSS | 会话劫持 | 输出转义 |
| CSRF | 伪造请求 | CSRF Token |
| 认证绕过 | 未授权访问 | 严格验证 |
| 越权访问 | 数据泄露 | 权限检查 |
| 敏感信息泄露 | 密钥泄露 | 环境变量 |

---

## 版本历史

- **v1.0.0**（2026-01-27）：初始版本
