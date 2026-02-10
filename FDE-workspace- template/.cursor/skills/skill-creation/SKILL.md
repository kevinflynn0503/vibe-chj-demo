---
name: skill-creation
description: Skill 创建指南。指导如何为 Agent 创建有效的 SKILL.md 文件。适用于需要创建新 Skill、整理知识包时。
---

# Skill Creation 技能

## 这是什么

这个技能指导你如何为 Agent 创建有效的 Skill。Skill 是模块化的知识包，让 Agent 具备特定领域的能力。

> **核心原则**：Skill 不是工具，而是指南。它告诉 Agent **怎么做**，而不是替 Agent 做。

---

## Skill 的本质

### Skill = 入职指南

把 Skill 想象成给新员工的入职文档：
- 告诉他这个领域要注意什么
- 提供常用的模板和流程
- 指向更详细的参考资料

### 不是什么

| Skill 是 | Skill 不是 |
|----------|-----------|
| 知识和指导 | 可执行的工具 |
| 领域专业知识 | 通用能力 |
| 工作流程说明 | 代码库 |

---

## Skill 结构

### 最简结构

```
my-skill/
└── SKILL.md    # 唯一必需的文件
```

### 完整结构

```
my-skill/
├── SKILL.md           # 主文件（必需）
├── reference.md       # 参考资料（可选）
├── examples.md        # 示例（可选）
├── templates/         # 模板文件（可选）
└── scripts/           # 辅助脚本（可选）
```

---

## SKILL.md 格式

### 基本格式

```markdown
---
name: my-skill-name
description: 一句话说明这个 skill 做什么，以及什么时候用。
---

# 标题

[具体内容]
```

### Frontmatter 字段

| 字段 | 必需 | 说明 |
|------|------|------|
| `name` | 是 | 小写字母+数字+连字符，最长64字符 |
| `description` | 是 | 描述功能和触发场景，最长1024字符 |

---

## 三个核心原则

### 1. 简洁至上

上下文窗口是公共资源。每个 token 都有成本。

**默认假设**：Agent 已经很聪明了，只补充它不知道的。

```markdown
# ❌ 太啰嗦
PDF (Portable Document Format) 是一种常见的文件格式，
包含文本、图片等内容。要提取文本，你需要使用库...

# ✅ 简洁
## 提取 PDF 文本
用 pdfplumber：
```python
import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```
```

### 2. 自由度匹配

根据任务的"脆弱程度"决定给多少自由度：

| 任务类型 | 自由度 | 写法 |
|----------|--------|------|
| 有多种正确方式 | 高 | 给原则和方向 |
| 有最佳实践 | 中 | 给伪代码或流程 |
| 必须精确执行 | 低 | 给具体脚本 |

### 3. 渐进式加载

SKILL.md 是概览，详细内容放在其他文件：

```markdown
# SKILL.md（简短概览）

## 快速开始
[基本用法]

## 更多内容
- 完整 API 参考：见 [reference.md](reference.md)
- 使用示例：见 [examples.md](examples.md)
```

Agent 需要时才会读取那些文件。

---

## 写好 Description

Description 决定 Agent 什么时候用这个 Skill。

### 要点

1. **用第三人称**（不要用"我"或"你"）
2. **包含触发词**（用户可能说的话）
3. **说明何时使用**

### 示例

```yaml
# ✅ 好的 description
description: 从 PDF 文件中提取文本和表格，填写表单，合并文档。当用户提到 PDF、表单、文档提取时使用。

# ❌ 不好的 description
description: 帮助处理文档
```

---

## 常用模式

### 模式1：工作流程

分步骤指导，适合复杂任务：

```markdown
## 企业调研流程

1. **收集基本信息**
   - 公司名称、行业、成立时间
   - 主营业务和产品

2. **分析核心团队**
   - 创始人背景
   - 关键人员履历

3. **评估技术能力**
   - 核心技术栈
   - 专利和资质

4. **输出报告**
   - 使用模板：[报告模板.md](templates/报告模板.md)
```

### 模式2：模板

提供输出格式：

```markdown
## 报告格式

```markdown
# [标题]

## 摘要
[一段话概述]

## 主要发现
- 发现1
- 发现2

## 建议
1. 建议1
2. 建议2
```
```

### 模式3：示例

用输入/输出示例说明期望：

```markdown
## 提交信息格式

**示例1：**
输入：添加了用户登录功能
输出：
```
feat(auth): 实现用户登录功能

- 添加登录接口
- 添加 token 验证
```

**示例2：**
输入：修复了日期显示错误
输出：
```
fix(ui): 修正日期格式化问题
```
```

### 模式4：条件分支

根据情况选择不同处理方式：

```markdown
## 文档处理

**创建新文档？**
→ 使用 docx 库从零创建

**编辑现有文档？**
→ 解压修改 XML 后重新打包
→ 每次修改后运行验证
```

---

## 结合工作空间

Skill 可以配合工作空间使用：

```markdown
## 工作空间配置

此 Skill 使用以下工作空间结构：

```
/workspace/企业研究/
├── memory/knowledge.csv    # 知识库
├── tasks/current.yaml      # 当前任务
├── data/enterprise_db.csv  # 企业数据
└── outputs/reports/        # 报告输出
```

## 操作流程

1. 读取 `tasks/current.yaml` 了解任务
2. 查询 `data/enterprise_db.csv` 获取已有数据
3. 执行调研，更新 `memory/knowledge.csv`
4. 输出到 `outputs/reports/`
```

---

## 避免什么

### ❌ 时效性信息

```markdown
# 不好
如果在 2025 年 8 月之前，用旧 API...

# 好
## 当前方法
用 v2 API...

## 历史方法（已弃用）
<details>
旧的 v1 API...
</details>
```

### ❌ 术语不一致

```markdown
# 不好
混用 "API endpoint"、"接口"、"路由"

# 好
全文统一用 "API 接口"
```

### ❌ 选项太多

```markdown
# 不好
你可以用 pypdf，或 pdfplumber，或 PyMuPDF...

# 好
用 pdfplumber：
[具体用法]
（如需 OCR，改用 pdf2image + pytesseract）
```

### ❌ 嵌套太深

```markdown
# 不好
SKILL.md → advanced.md → details.md → actual_info.md

# 好
SKILL.md 直接链接所有文件（一层深度）
```

---

## 检查清单

创建 Skill 前，检查：

- [ ] name 是小写+连字符格式？
- [ ] description 说明了功能和触发场景？
- [ ] SKILL.md 少于 500 行？
- [ ] 大段内容拆分到了其他文件？
- [ ] 没有时效性信息？
- [ ] 术语一致？
- [ ] 文件引用只有一层深度？
- [ ] 用实际任务测试过？

---

## 示例：企业研究 Skill

```markdown
---
name: enterprise-research
description: 对企业进行深度调研，生成一企一策报告。当用户提到企业调研、公司分析、一企一策时使用。
---

# 企业研究

## 快速开始

收到企业名称后，按以下流程执行：

1. 创建工作目录
2. 收集公开信息
3. 分析核心团队
4. 分析技术/商业模式
5. 生成报告

## 报告模板

见 [templates/一企一策模板.md](templates/一企一策模板.md)

## 数据来源

- 工商信息：企查查、天眼查
- 新闻动态：百度新闻
- 专利信息：国家知识产权局

## 工作空间

使用 `workspace-design` 中的企业研究空间结构。
```

---

## 参考资料

- [Anthropic Skills 文档](https://docs.claude.com/en/docs/claude-code/skills)
- [Skill 最佳实践](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/best-practices)

---

## 版本历史

- **v1.0.0**（2026-01-28）：初始版本
  - 基于 Anthropic 官方最佳实践
  - 结合工作空间设计
