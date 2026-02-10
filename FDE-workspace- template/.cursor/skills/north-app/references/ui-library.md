# UI/UX 智能库

> 可搜索的UI风格、配色方案、字体组合、组件最佳实践数据库

---

## 使用方式

当用户请求UI/UX工作时，按以下步骤收集信息：

### 步骤1：分析用户需求

从用户请求中提取：
- **产品类型**：SaaS、电商、作品集、仪表板等
- **风格关键词**：极简、俏皮、专业、优雅等
- **行业**：医疗、金融科技、游戏、教育等
- **技术栈**：React、Vue、Next.js等

### 步骤2：查询各领域

| 领域 | 查询内容 | 示例关键词 |
|------|----------|-----------|
| 产品 | 产品类型建议 | SaaS、电商、作品集 |
| 风格 | UI风格、颜色、效果 | 玻璃态、极简、暗色模式 |
| 字体 | 字体组合、Google Fonts | 优雅、俏皮、专业 |
| 配色 | 配色方案 | 医疗、金融、美容 |
| 落地页 | 页面结构、CTA策略 | hero、pricing、testimonial |
| UX | 最佳实践、反模式 | 动画、无障碍、加载 |

---

## 风格速查表

### 玻璃态（Glassmorphism）

```css
background: rgba(255, 255, 255, 0.1);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.2);
border-radius: 16px;
```

**适用**：现代、科技感
**注意**：需要半透明背景

### 新拟态（Neumorphism）

```css
background: #e0e0e0;
box-shadow: 
  8px 8px 16px #bebebe,
  -8px -8px 16px #ffffff;
border-radius: 12px;
```

**适用**：柔和、高级感
**注意**：对比度低，慎用于重要元素

### 极简主义

```css
background: #ffffff;
color: #1a1a1a;
font-family: 'Inter', sans-serif;
/* 大量留白 */
padding: 2rem 4rem;
```

**适用**：专业、高端
**特点**：少即是多

---

## 配色方案速查

### SaaS产品

```css
--primary: #3B82F6;    /* 蓝色：信任 */
--secondary: #10B981;  /* 绿色：成功 */
--accent: #8B5CF6;     /* 紫色：创新 */
--background: #F8FAFC;
--text: #1E293B;
```

### 电商

```css
--primary: #F97316;    /* 橙色：行动 */
--secondary: #EAB308;  /* 黄色：促销 */
--accent: #EF4444;     /* 红色：紧迫 */
--background: #FFFFFF;
--text: #0F172A;
```

### 医疗健康

```css
--primary: #0EA5E9;    /* 浅蓝：清洁 */
--secondary: #22C55E;  /* 绿色：健康 */
--accent: #06B6D4;     /* 青色：专业 */
--background: #F0F9FF;
--text: #0C4A6E;
```

---

## 字体组合推荐

### 专业/企业

```css
/* 标题 */
font-family: 'Inter', sans-serif;
font-weight: 700;

/* 正文 */
font-family: 'Inter', sans-serif;
font-weight: 400;
```

### 优雅/高端

```css
/* 标题 */
font-family: 'Playfair Display', serif;
font-weight: 700;

/* 正文 */
font-family: 'Lato', sans-serif;
font-weight: 400;
```

### 现代/科技

```css
/* 标题 */
font-family: 'Space Grotesk', sans-serif;
font-weight: 700;

/* 正文 */
font-family: 'DM Sans', sans-serif;
font-weight: 400;
```

---

## 通用UI规则

### 图标和视觉元素

| 规则 | 应该 | 不应该 |
|------|------|--------|
| 图标 | 使用SVG（Heroicons、Lucide） | 使用emoji作为UI图标 |
| 悬停 | 颜色/透明度过渡 | 会移动布局的缩放 |
| Logo | 从Simple Icons获取官方SVG | 猜测或使用错误的logo |
| 图标尺寸 | 固定viewBox配合w-6 h-6 | 随机混用不同尺寸 |

### 交互和光标

| 规则 | 应该 | 不应该 |
|------|------|--------|
| 可点击元素 | 添加 `cursor-pointer` | 保留默认光标 |
| 悬停反馈 | 颜色、阴影、边框变化 | 无视觉反馈 |
| 过渡 | `transition-colors duration-200` | 即时变化或太慢 |

### 浅色/深色模式

| 规则 | 浅色模式 | 深色模式 |
|------|----------|----------|
| 玻璃卡片 | `bg-white/80` | `bg-white/10` |
| 文字 | `#0F172A` | `#F8FAFC` |
| 次要文字 | `#475569` | `#94A3B8` |
| 边框 | `border-gray-200` | `border-white/10` |

---

## 交付前检查清单

### 视觉质量
- [ ] 没有使用emoji作为图标
- [ ] 图标来自一致的图标集
- [ ] 品牌Logo正确
- [ ] 悬停状态不会导致布局移动

### 交互
- [ ] 所有可点击元素有 `cursor-pointer`
- [ ] 悬停状态提供清晰反馈
- [ ] 过渡平滑（150-300ms）
- [ ] 焦点状态可见

### 浅色/深色模式
- [ ] 文字对比度足够（最低4.5:1）
- [ ] 玻璃/透明元素在两种模式都可见
- [ ] 边框在两种模式都可见
- [ ] 交付前测试两种模式

### 布局
- [ ] 浮动元素与边缘有适当间距
- [ ] 没有内容隐藏在固定导航栏后面
- [ ] 响应式：320px、768px、1024px、1440px
- [ ] 移动端没有水平滚动

### 无障碍
- [ ] 所有图片有alt文本
- [ ] 表单输入有label
- [ ] 颜色不是唯一指示器
- [ ] 尊重 `prefers-reduced-motion`
