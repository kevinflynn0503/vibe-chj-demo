-- ============================================
-- North App 数据库 Schema 模板
-- ============================================
-- ⚠️ 修改表名和字段为你的业务需要
-- 执行方式：在 Supabase Dashboard -> SQL Editor 中运行
-- ============================================

-- ============================================
-- 1. 项目表（核心表）
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,

  -- 基本信息
  title TEXT NOT NULL,
  description TEXT DEFAULT '',

  -- 状态
  status TEXT DEFAULT 'pending',  -- pending | running | completed | failed
  error_message TEXT,

  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引（必须）
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- ============================================
-- 2. 触发器：自动更新 updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. 启用 Realtime（必须）
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE projects;

-- ============================================
-- ⚠️ 添加你的业务表
-- ============================================
-- 示例：如果你需要一个详情内容表
--
-- CREATE TABLE IF NOT EXISTS project_items (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
--   user_id TEXT NOT NULL,
--
--   -- 业务字段
--   item_type TEXT NOT NULL,
--   content TEXT NOT NULL,
--   sort_order INT NOT NULL DEFAULT 0,
--
--   -- 时间戳
--   created_at TIMESTAMPTZ DEFAULT NOW(),
--   updated_at TIMESTAMPTZ DEFAULT NOW()
-- );
--
-- CREATE INDEX IF NOT EXISTS idx_project_items_project ON project_items(project_id, sort_order);
-- ALTER PUBLICATION supabase_realtime ADD TABLE project_items;
