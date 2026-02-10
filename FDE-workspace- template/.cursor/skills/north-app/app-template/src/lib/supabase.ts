/**
 * Supabase 客户端 + CRUD 操作
 *
 * ⚠️ 使用前必须：
 * 1. 运行 supabase-schema.sql 创建表
 * 2. 在 .env.local 配置 SUPABASE_URL 和 ANON_KEY
 * 3. 修改表名和字段为你的业务需要
 */

'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// ============================================
// 类型定义 — ⚠️ 根据你的业务修改
// ============================================

export type ProjectStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectParams {
  userId: string;
  title: string;
  description?: string;
}

export interface UpdateProjectParams {
  title?: string;
  description?: string;
  status?: ProjectStatus;
}

// ============================================
// Supabase 客户端
// ============================================

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY',
    );
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
      params: { eventsPerSecond: 10 },
      timeout: 60000,
      heartbeatIntervalMs: 25000,
    },
  });

  return supabaseClient;
}

export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// ============================================
// CRUD 操作 — ⚠️ 根据你的表名修改
// ============================================

const TABLE_NAME = 'projects'; // ⚠️ 修改为你的表名

/** 创建项目 */
export async function createProject(params: CreateProjectParams): Promise<Project> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from(TABLE_NAME)
    .insert({
      user_id: params.userId,
      title: params.title,
      description: params.description ?? '',
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw new Error(`创建失败: ${error.message}`);
  return data as Project;
}

/** 获取单个项目 */
export async function getProject(id: string): Promise<Project | null> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from(TABLE_NAME)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`获取失败: ${error.message}`);
  }

  return data as Project;
}

/** 更新项目 */
export async function updateProject(id: string, params: UpdateProjectParams): Promise<Project> {
  const client = getSupabaseClient();

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (params.title !== undefined) updateData.title = params.title;
  if (params.description !== undefined) updateData.description = params.description;
  if (params.status !== undefined) updateData.status = params.status;

  const { data, error } = await client
    .from(TABLE_NAME)
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`更新失败: ${error.message}`);
  return data as Project;
}

/** 删除项目 */
export async function deleteProject(id: string): Promise<void> {
  const client = getSupabaseClient();

  const { error } = await client.from(TABLE_NAME).delete().eq('id', id);
  if (error) throw new Error(`删除失败: ${error.message}`);
}

/** 查询项目列表 */
export async function listProjects(userId: string): Promise<Project[]> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from(TABLE_NAME)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`查询失败: ${error.message}`);
  return (data ?? []) as Project[];
}
