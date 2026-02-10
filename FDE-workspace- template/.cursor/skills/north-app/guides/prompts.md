# Prompt 构建

## Prompt 结构概览

```
<reference>
<!-- METADATA_JSON: {...} -->

【分析框架 - 模板名称】
模块列表...

【格式指南】
格式说明...

【输出要求】
章节数、字数等...

【参考文献格式要求】
JSON 格式说明...

【supabase_tool 参数结构】
数据库操作指令...

【参考资料】（可选）
参考资料列表...

【执行步骤】
具体步骤...
</reference> 简单请求文案
```

## 核心数据结构

### PromptData 接口

```typescript
interface PromptData {
  metadata: {
    app: 'your-app-name';
    projectId: string;
    topic: string;
    userId: string;
    templateId: string;
    templateName: string;
  };
  
  template: {
    modules: TemplateModule[];
    format_guide: string;
    output_requirements: OutputRequirements;
    reference_guide: string;
  };
  
  instructions: {
    database: string;
  };
  
  materials?: PromptMaterial[];
}
```

### TemplateModule 接口

```typescript
interface TemplateModule {
  id: string;
  name: string;              // 模块名称，如 "企业概览"
  description: string;       // 模块详细说明
  format: ModuleFormat;      // 建议格式：auto/table/timeline/list/text/quote
}

type ModuleFormat = 'auto' | 'table' | 'timeline' | 'list' | 'text' | 'quote';
```

## Metadata（元数据）

以 JSON 注释形式嵌入，便于解析：

```typescript
const metadataJson = JSON.stringify({
  app: 'research-book',
  projectId: 'xxx-xxx',
  topic: '腾讯控股',
  userId: 'user-123',
  templateId: 'template-1',
  templateName: '企业研究',
});

referenceContent += `<!-- METADATA_JSON: ${metadataJson} -->\n\n`;
```

## 模块列表

```typescript
const FORMAT_HINTS: Record<ModuleFormat, string> = {
  auto: '',
  table: '（建议：使用表格呈现）',
  timeline: '（建议：使用时间线呈现）',
  list: '（建议：使用列表呈现）',
  text: '（建议：使用文本段落呈现）',
  quote: '（建议：使用引用块呈现）',
};

function modulesToPromptText(modules: TemplateModule[]): string {
  return modules
    .map((m, index) => {
      const formatHint = FORMAT_HINTS[m.format] || '';
      return `${index + 1}. **${m.name}**
   ${m.description}
   ${formatHint}`;
    })
    .join('\n\n');
}
```

## 数据库操作指令

**关键：必须明确 `supabase_tool` 参数结构！**

```typescript
const DATABASE_INSTRUCTIONS = `
【supabase_tool 参数结构 - 必须严格遵守！】

█  ⚠️⚠️⚠️ 最重要的规则：所有业务数据必须放在 "data" 对象里！  █

【只有这6个是顶级参数】
1. app_name    → 固定 "your-app-name"
2. operation   → "create" / "get" / "update" / "list" / "delete"
3. sys_user_id → 用户ID（必填）
4. table       → 表名
5. record_id   → 记录ID（get/update/delete 必填）
6. data        → 业务数据对象（create/update 必填）

【业务数据必须放在 data 里】
✅ 正确：
{
  "app_name": "your-app",
  "operation": "update",
  "sys_user_id": "user-123",
  "table": "projects",
  "record_id": "xxx",
  "data": {
    "status": "completed",  // 业务字段在 data 里
    "title": "新标题"
  }
}

❌ 错误：
{
  "app_name": "your-app",
  "operation": "update",
  "sys_user_id": "user-123",
  "table": "projects",
  "record_id": "xxx",
  "status": "completed"  // 业务字段不能放顶级！
}
`;
```

## 执行步骤

为不同内容格式提供具体步骤：

```typescript
const REPORT_STEPS = `
【执行步骤】

1. **创建报告块**：
   - 先创建 title 块 (block_type='title', block_order=1)
   - 再创建 summary 块 (block_type='summary', block_order=2)
   - 然后按顺序创建 section 块 (block_order 递增)

2. **每个模块一个 section**：
   - 按分析框架的模块顺序逐个创建
   - 内容使用 Markdown 格式

3. **完成后更新项目状态**：
   - operation: "update"
   - table: "projects"
   - data: { "status": "completed" }
`;
```

## 完整构建函数

```typescript
export function buildPromptWithTemplate(
  template: Template,
  topic: string,
  projectId: string,
  userId: string,
  materials?: Material[],
): string {
  let referenceContent = '';

  // 1. 元数据
  const promptData: PromptData = {
    metadata: {
      app: 'your-app',
      projectId,
      topic,
      userId,
      templateId: template.id,
      templateName: template.name,
    },
    template: {
      modules: template.modules,
      format_guide: DEFAULT_FORMAT_GUIDE,
      output_requirements: DEFAULT_OUTPUT_REQUIREMENTS,
      reference_guide: DEFAULT_REFERENCE_GUIDE,
    },
    instructions: {
      database: DATABASE_INSTRUCTIONS,
    },
    materials: materials?.map(m => ({
      name: m.name,
      type: m.type,
      uri: m.uri,
    })),
  };

  referenceContent += `<!-- METADATA_JSON: ${JSON.stringify(promptData)} -->\n\n`;

  // 2. 分析框架
  referenceContent += `【分析框架 - ${template.name}】\n\n`;
  referenceContent += modulesToPromptText(template.modules);
  referenceContent += '\n\n';

  // 3. 格式指南
  referenceContent += `【格式指南】\n${DEFAULT_FORMAT_GUIDE}\n\n`;

  // 4. 输出要求
  referenceContent += `【输出要求】\n`;
  referenceContent += `- 章节数：${DEFAULT_OUTPUT_REQUIREMENTS.sections}\n`;
  referenceContent += `- 字数：${DEFAULT_OUTPUT_REQUIREMENTS.words}\n\n`;

  // 5. 数据库指令
  referenceContent += DATABASE_INSTRUCTIONS + '\n\n';

  // 6. 参考资料（如有）
  if (materials && materials.length > 0) {
    referenceContent += '【参考资料】\n';
    materials.forEach((m, i) => {
      referenceContent += `${i + 1}. ${m.name} (${m.type})\n`;
    });
    referenceContent += '\n';
  }

  // 7. 执行步骤
  referenceContent += REPORT_STEPS;

  // 8. 构建最终 Prompt
  const simpleRequest = `调研${topic}，生成报告`;
  return `<reference>\n${referenceContent}</reference> ${simpleRequest}`;
}
```

## 设计原则

1. **结构化组织**
   - 使用 `<reference>` 包裹详细指令
   - 外层显示简洁的用户请求
   - 便于 UI 折叠/展开

2. **模板驱动**
   - 模板从数据库动态加载
   - 支持用户自定义
   - 模块化设计，易于扩展

3. **数据库操作规范**
   - 明确参数结构
   - 强调业务数据位置
   - 提供正确/错误示例

4. **可解析性**
   - Metadata 使用 JSON 格式
   - 便于前端解析和处理
