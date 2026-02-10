# 代码审查指南

## 概述

本指南定义了Vibe FDE项目中代码审查的标准和流程。

---

## 审查维度

### 1. 功能正确性

- [ ] 代码实现是否符合需求
- [ ] 边界条件是否处理
- [ ] 错误情况是否处理
- [ ] 业务逻辑是否正确

### 2. 代码质量

- [ ] 命名是否清晰有意义
- [ ] 函数是否单一职责
- [ ] 代码是否重复（DRY）
- [ ] 复杂度是否合理

### 3. 可维护性

- [ ] 代码是否易于理解
- [ ] 注释是否充足且有价值
- [ ] 模块划分是否合理
- [ ] 依赖是否清晰

### 4. 安全性

- [ ] 输入是否验证
- [ ] 敏感数据是否保护
- [ ] 权限是否检查
- [ ] 安全漏洞是否防范

### 5. 性能

- [ ] 算法效率是否合理
- [ ] 是否有不必要的计算
- [ ] 数据库查询是否优化
- [ ] 内存使用是否合理

### 6. 测试

- [ ] 测试覆盖是否充足
- [ ] 测试用例是否有意义
- [ ] 边界情况是否测试
- [ ] 测试是否可维护

---

## 代码规范检查

### TypeScript/JavaScript

```typescript
// ✅ 好的代码
interface CreateUserInput {
  email: string;
  name: string;
  password: string;
}

async function createUser(input: CreateUserInput): Promise<User> {
  // 验证输入
  validateEmail(input.email);
  validatePassword(input.password);

  // 检查用户是否存在
  const existingUser = await userRepository.findByEmail(input.email);
  if (existingUser) {
    throw new ConflictError('User already exists');
  }

  // 创建用户
  const hashedPassword = await hashPassword(input.password);
  const user = await userRepository.create({
    ...input,
    password: hashedPassword,
  });

  return user;
}

// ❌ 差的代码
async function createUser(e: string, n: string, p: string) {
  const u = await db.query('SELECT * FROM users WHERE email = ?', [e]);
  if (u) throw new Error('exists');
  const hp = await hash(p);
  return await db.query('INSERT INTO users...', [e, n, hp]);
}
```

### React组件

```tsx
// ✅ 好的组件
interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const handleToggle = useCallback(() => {
    onToggle(todo.id);
  }, [todo.id, onToggle]);

  const handleDelete = useCallback(() => {
    onDelete(todo.id);
  }, [todo.id, onDelete]);

  return (
    <div className={cn('todo-item', { completed: todo.completed })}>
      <Checkbox checked={todo.completed} onChange={handleToggle} />
      <span className="todo-title">{todo.title}</span>
      <Button variant="ghost" onClick={handleDelete}>
        <TrashIcon />
      </Button>
    </div>
  );
}

// ❌ 差的组件
export function TodoItem(props: any) {
  return (
    <div style={{ display: 'flex' }}>
      <input 
        type="checkbox" 
        checked={props.todo.completed}
        onChange={() => props.onToggle(props.todo.id)}
      />
      <span>{props.todo.title}</span>
      <button onClick={() => props.onDelete(props.todo.id)}>Delete</button>
    </div>
  );
}
```

---

## 常见问题清单

### 命名问题

| 问题 | 示例 | 建议 |
|------|------|------|
| 缩写 | `usr`, `btn`, `msg` | `user`, `button`, `message` |
| 单字母 | `a`, `b`, `x` | 有意义的名称 |
| 类型前缀 | `strName`, `arrItems` | 不需要类型前缀 |
| 否定命名 | `isNotValid`, `notEmpty` | `isValid`, `hasItems` |

### 函数问题

| 问题 | 描述 | 建议 |
|------|------|------|
| 过长 | 超过30行 | 拆分为小函数 |
| 多职责 | 做多件事 | 单一职责 |
| 副作用 | 隐藏的状态修改 | 明确副作用 |
| 过多参数 | 超过3个参数 | 使用对象参数 |

### 安全问题

| 问题 | 风险 | 修复 |
|------|------|------|
| SQL注入 | 数据泄露 | 参数化查询 |
| XSS | 脚本注入 | 转义输出 |
| 硬编码密钥 | 密钥泄露 | 环境变量 |
| 未验证输入 | 数据损坏 | 输入验证 |

---

## 审查流程

### 1. 自审

提交代码前，开发者应自审：

```markdown
## 自审清单

- [ ] 代码符合需求
- [ ] 测试通过
- [ ] 无 lint 错误
- [ ] 文档已更新
- [ ] 无敏感信息
```

### 2. 同伴审查

```markdown
## 审查报告

### 文件变更
- `src/services/user.service.ts` - 新增用户服务
- `src/api/users.ts` - 新增用户API

### 优点
1. 代码结构清晰
2. 错误处理完善
3. 测试覆盖充足

### 问题

#### 必须修复
1. **[安全]** `user.service.ts:45` - 密码未加密存储
   ```typescript
   // 当前
   user.password = input.password;
   // 建议
   user.password = await hashPassword(input.password);
   ```

#### 建议修复
1. **[性能]** `users.ts:23` - 建议添加分页
   ```typescript
   // 当前
   const users = await userService.findAll();
   // 建议
   const { users, total } = await userService.findAll({ page, limit });
   ```

### 结论
- [ ] ✅ 批准
- [x] ❌ 需要修改
```

### 3. 审查循环

```
提交代码 → 自审 → 提交PR → 同伴审查 → 修复问题 → 重新审查 → 批准 → 合并
```

---

## 审查礼仪

### 审查者

- ✅ 提供建设性反馈
- ✅ 解释问题原因
- ✅ 给出修复建议
- ❌ 不要人身攻击
- ❌ 不要过于挑剔
- ❌ 不要延迟审查

### 被审查者

- ✅ 认真对待反馈
- ✅ 及时响应问题
- ✅ 解释设计决策
- ❌ 不要防御性回应
- ❌ 不要忽视反馈
- ❌ 不要强行合并

---

## 自动化检查

### ESLint配置

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
  },
};
```

### Prettier配置

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### Pre-commit Hook

```bash
# .husky/pre-commit
npm run lint
npm run type-check
npm run test:unit
```

---

## 版本历史

- **v1.0.0**（2026-01-27）：初始版本
