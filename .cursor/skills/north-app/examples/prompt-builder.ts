/**
 * Prompt 构建示例
 * 
 * 演示如何构建与 Agent 交互的 Prompt
 */

// ============================================
// 类型定义
// ============================================

interface TemplateModule {
  id: string;
  name: string;
  description: string;
  format: 'auto' | 'table' | 'timeline' | 'list' | 'text' | 'quote';
}

interface Template {
  id: string;
  name: string;
  modules: TemplateModule[];
}

interface Material {
  name: string;
  type: string;
  uri: string;
}

interface PromptData {
  metadata: {
    app: string;
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
  materials?: { name: string; type: string; uri: string }[];
}

interface OutputRequirements {
  sections: string;
  words: string;
  tables: string;
}

// ============================================
// 常量
// ============================================

const FORMAT_HINTS: Record<string, string> = {
  auto: '',
  table: '（建议：使用表格呈现）',
  timeline: '（建议：使用时间线呈现）',
  list: '（建议：使用列表呈现）',
  text: '（建议：使用文本段落呈现）',
  quote: '（建议：使用引用块呈现）',
};

const DEFAULT_FORMAT_GUIDE = `
【表格格式】
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 数据1 | 数据2 | 数据3 |

【时间线格式】
@timeline
2020年|事件描述
2021年|事件描述
2022年|事件描述

【引用块格式】
> 引用内容
> 可以多行
`;

const DEFAULT_OUTPUT_REQUIREMENTS: OutputRequirements = {
  sections: '5-8 个章节',
  words: '3000-5000 字',
  tables: '至少 3 个表格',
};

const DEFAULT_REFERENCE_GUIDE = `
【参考文献格式】
必须使用 JSON 格式：
[
  {"id": 1, "title": "标题", "url": "https://..."},
  {"id": 2, "title": "标题", "url": "https://..."}
]
`;

// ============================================
// 数据库操作指令
// ============================================

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

【正确示例】
{
  "app_name": "your-app",
  "operation": "create",
  "sys_user_id": "user-123",
  "table": "report_blocks",
  "data": {
    "project_id": "xxx",
    "block_type": "section",
    "block_order": 1,
    "content": "# 章节标题\\n\\n内容..."
  }
}

【错误示例 - 业务字段不能放顶级！】
{
  "app_name": "your-app",
  "operation": "create",
  "project_id": "xxx",  // ❌ 错误！
  "content": "..."       // ❌ 错误！
}
`;

// ============================================
// 执行步骤
// ============================================

const REPORT_STEPS = `
【执行步骤】

1. **创建报告块**：
   - 先创建 title 块 (block_type='title', block_order=1)
   - 再创建 summary 块 (block_type='summary', block_order=2)
   - 然后按顺序创建 section 块 (block_order 递增: 3, 4, 5...)

2. **每个模块一个 section**：
   - 按分析框架的模块顺序逐个创建
   - 内容使用 Markdown 格式
   - block_order 必须递增，不能重复

3. **完成后更新项目状态**：
   supabase_tool({
     "app_name": "your-app",
     "operation": "update",
     "sys_user_id": "用户ID",
     "table": "projects",
     "record_id": "项目ID",
     "data": { "status": "completed" }
   })
`;

// ============================================
// 核心构建函数
// ============================================

/**
 * 将模块列表转换为 Prompt 文本
 */
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

/**
 * 构建完整的 Prompt
 */
export function buildPromptWithTemplate(
  template: Template,
  topic: string,
  projectId: string,
  userId: string,
  materials?: Material[],
): string {
  let referenceContent = '';

  // 1. 构建 PromptData（用于元数据）
  const promptData: PromptData = {
    metadata: {
      app: 'your-app-name',
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
    materials: materials?.map((m) => ({
      name: m.name,
      type: m.type,
      uri: m.uri,
    })),
  };

  // 2. 添加 JSON 元数据注释
  referenceContent += `<!-- METADATA_JSON: ${JSON.stringify(promptData)} -->\n\n`;

  // 3. 添加分析框架
  referenceContent += `【分析框架 - ${template.name}】\n\n`;
  referenceContent += modulesToPromptText(template.modules);
  referenceContent += '\n\n';

  // 4. 添加格式指南
  referenceContent += `【格式指南】\n${DEFAULT_FORMAT_GUIDE}\n\n`;

  // 5. 添加输出要求
  referenceContent += `【输出要求】\n`;
  referenceContent += `- 章节数：${DEFAULT_OUTPUT_REQUIREMENTS.sections}\n`;
  referenceContent += `- 字数：${DEFAULT_OUTPUT_REQUIREMENTS.words}\n`;
  referenceContent += `- 表格：${DEFAULT_OUTPUT_REQUIREMENTS.tables}\n\n`;

  // 6. 添加参考文献格式
  referenceContent += `【参考文献格式要求】\n${DEFAULT_REFERENCE_GUIDE}\n\n`;

  // 7. 添加数据库操作指令
  referenceContent += DATABASE_INSTRUCTIONS + '\n\n';

  // 8. 添加参考资料（如果有）
  if (materials && materials.length > 0) {
    referenceContent += '【参考资料】\n';
    materials.forEach((m, i) => {
      referenceContent += `${i + 1}. ${m.name} (${m.type})\n`;
      if (m.uri) {
        referenceContent += `   路径: ${m.uri}\n`;
      }
    });
    referenceContent += '\n';
  }

  // 9. 添加执行步骤
  referenceContent += REPORT_STEPS;

  // 10. 构建最终 Prompt
  const simpleRequest = `调研${topic}，生成研究报告`;
  return `<reference>\n${referenceContent}</reference> ${simpleRequest}`;
}

// ============================================
// 使用示例
// ============================================

/*
// 定义模板
const template: Template = {
  id: 'enterprise-research',
  name: '企业研究',
  modules: [
    {
      id: '1',
      name: '企业概览',
      description: '公司基本信息、发展历程、核心业务',
      format: 'table',
    },
    {
      id: '2',
      name: '商业模式',
      description: '盈利模式、收入结构、核心竞争力',
      format: 'text',
    },
    {
      id: '3',
      name: '发展历程',
      description: '关键里程碑、重大事件',
      format: 'timeline',
    },
  ],
};

// 构建 Prompt
const prompt = buildPromptWithTemplate(
  template,
  '腾讯控股',
  'project-123',
  'user-456',
  [{ name: '年报.pdf', type: 'pdf', uri: 'files/xxx.pdf' }],
);

// 发送给 Agent
await hostAPI.sendChat(prompt);
*/

export default buildPromptWithTemplate;
