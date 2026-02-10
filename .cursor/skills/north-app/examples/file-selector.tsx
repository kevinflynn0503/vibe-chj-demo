/**
 * 文件选择器示例
 * 
 * 功能：
 * 1. 从工作空间选择文件
 * 2. 支持文件夹展开
 * 3. 支持多选
 */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@north/design';
import { FileIcon, YellowFolderIcon } from '@north/design';
import { cn, formatFileSize } from '@north/common';
import { useHostAPI, DriveFile } from '@/lib/host-api';

// ============================================
// 文件选择器对话框
// ============================================

interface FileSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (files: DriveFile[]) => void;
  multiple?: boolean;
}

export function SDKFileSelectorDialog({
  open,
  onOpenChange,
  onSelect,
  multiple = true,
}: FileSelectorDialogProps) {
  const hostAPI = useHostAPI();
  
  // 状态
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<DriveFile[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [folderContents, setFolderContents] = useState<Record<string, DriveFile[]>>({});

  // ============================================
  // 加载文件
  // ============================================

  const loadRootFiles = useCallback(async () => {
    setLoading(true);
    try {
      const result = await hostAPI.listDriveFiles(null, { limit: 100 });
      setFiles(result.files);
    } catch (error) {
      console.error('[FileSelectorDialog] 加载文件失败:', error);
    } finally {
      setLoading(false);
    }
  }, [hostAPI]);

  // 打开时加载
  useEffect(() => {
    if (open) {
      loadRootFiles();
      setSelectedFiles([]);
      setExpandedFolders(new Set());
    }
  }, [open, loadRootFiles]);

  // ============================================
  // 文件夹操作
  // ============================================

  const toggleFolder = async (folder: DriveFile) => {
    const folderId = folder.id;
    const newExpanded = new Set(expandedFolders);

    if (newExpanded.has(folderId)) {
      // 折叠
      newExpanded.delete(folderId);
    } else {
      // 展开
      newExpanded.add(folderId);
      // 加载子文件（如果未缓存）
      if (!folderContents[folderId]) {
        try {
          const children = await hostAPI.listDriveFiles(folderId, { limit: 100 });
          setFolderContents((prev) => ({ ...prev, [folderId]: children.files }));
        } catch (error) {
          console.error('[FileSelectorDialog] 加载文件夹内容失败:', error);
        }
      }
    }

    setExpandedFolders(newExpanded);
  };

  // ============================================
  // 文件选择
  // ============================================

  const toggleFileSelection = (file: DriveFile) => {
    if (file.isFolder) return;

    setSelectedFiles((prev) => {
      const isSelected = prev.some((f) => f.id === file.id);
      
      if (isSelected) {
        return prev.filter((f) => f.id !== file.id);
      }
      
      if (multiple) {
        return [...prev, file];
      }
      
      return [file];
    });
  };

  // ============================================
  // 确认选择
  // ============================================

  const handleConfirm = () => {
    onSelect(selectedFiles);
    onOpenChange(false);
  };

  // ============================================
  // 渲染文件树
  // ============================================

  const renderFileTree = (files: DriveFile[], level = 0) => (
    <div style={{ paddingLeft: level * 16 }}>
      {files.map((file) => (
        <div key={file.id}>
          {/* 文件/文件夹行 */}
          <div
            className={cn(
              'flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 transition-colors',
              'hover:bg-gray-50',
              selectedFiles.some((f) => f.id === file.id) && 'bg-blue-50'
            )}
            onClick={() =>
              file.isFolder ? toggleFolder(file) : toggleFileSelection(file)
            }
          >
            {/* 文件夹展开图标 */}
            {file.isFolder && (
              <svg
                className={cn(
                  'h-4 w-4 text-gray-400 transition-transform',
                  expandedFolders.has(file.id) && 'rotate-90'
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}

            {/* 图标 */}
            {file.isFolder ? (
              <YellowFolderIcon className="h-4 w-4" />
            ) : (
              <FileIcon className="h-4 w-4" />
            )}

            {/* 文件名 */}
            <span className="flex-1 truncate text-sm">{file.name}</span>

            {/* 文件大小 */}
            {!file.isFolder && file.size && (
              <span className="ml-auto text-xs text-gray-400">
                {formatFileSize(file.size)}
              </span>
            )}

            {/* 选中标记 */}
            {!file.isFolder && selectedFiles.some((f) => f.id === file.id) && (
              <svg
                className="h-4 w-4 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>

          {/* 子文件夹内容 */}
          {file.isFolder &&
            expandedFolders.has(file.id) &&
            folderContents[file.id] && (
              renderFileTree(folderContents[file.id], level + 1)
            )}
        </div>
      ))}
    </div>
  );

  // ============================================
  // 渲染
  // ============================================

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>选择文件</DialogTitle>
        </DialogHeader>

        {/* 文件列表 */}
        <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-100">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
            </div>
          ) : files.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">
              暂无文件
            </div>
          ) : (
            <div className="p-2">{renderFileTree(files)}</div>
          )}
        </div>

        {/* 底部操作 */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="text-sm text-gray-500">
            已选择 {selectedFiles.length} 个文件
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedFiles.length === 0}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              确认
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// 使用示例
// ============================================

/*
export function MaterialSelector() {
  const [showFileSelector, setShowFileSelector] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<DriveFile[]>([]);

  const handleFilesSelected = (files: DriveFile[]) => {
    setSelectedFiles(prev => [...prev, ...files]);
  };

  return (
    <div>
      <button onClick={() => setShowFileSelector(true)}>
        从空间选择
      </button>

      <SDKFileSelectorDialog
        open={showFileSelector}
        onOpenChange={setShowFileSelector}
        onSelect={handleFilesSelected}
      />

      <div>
        {selectedFiles.map(file => (
          <div key={file.id}>{file.name}</div>
        ))}
      </div>
    </div>
  );
}
*/
